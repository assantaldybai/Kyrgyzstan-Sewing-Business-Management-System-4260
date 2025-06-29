import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [factory, setFactory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setProfile(null);
          setFactory(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId) => {
    try {
      // Load user profile with factory information
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          *,
          factories (
            id,
            name,
            owner_id,
            subscription_plan,
            is_active,
            settings,
            has_completed_onboarding,
            created_at
          )
        `)
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error loading profile:', profileError);
        setProfile(null);
        setFactory(null);
      } else {
        setProfile(profileData);
        setFactory(profileData.factories);
      }
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
      setProfile(null);
      setFactory(null);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setProfile(null);
      setFactory(null);
    }
    return { error };
  };

  const createFactory = async (factoryName) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-factory', {
        body: { factory_name: factoryName }
      });

      if (error) throw error;

      // Reload user profile to get the new factory
      if (user) {
        await loadUserProfile(user.id);
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error creating factory:', error);
      return { data: null, error };
    }
  };

  const completeOnboarding = async (onboardingData) => {
    try {
      if (!factory?.id) {
        throw new Error('No factory found');
      }

      // 1. Create technologist if provided
      if (onboardingData.technologist?.name) {
        const { error: techError } = await supabase
          .from('profiles')
          .insert({
            first_name: onboardingData.technologist.name.split(' ')[0],
            last_name: onboardingData.technologist.name.split(' ').slice(1).join(' '),
            email: onboardingData.technologist.email || null,
            phone: onboardingData.technologist.phone || null,
            role: 'technologist',
            factory_id: factory.id,
            position: 'Технолог'
          });

        if (techError) {
          console.error('Error creating technologist:', techError);
        }
      }

      // 2. Create equipment types
      if (onboardingData.equipment?.length > 0) {
        const equipmentData = onboardingData.equipment
          .filter(eq => eq.name.trim())
          .map(eq => ({
            name: eq.name,
            base_rate: parseFloat(eq.baseRate) || 0,
            factory_id: factory.id,
            category: 'sewing'
          }));

        if (equipmentData.length > 0) {
          const { error: equipError } = await supabase
            .from('equipment_types')
            .insert(equipmentData);

          if (equipError) {
            console.error('Error creating equipment:', equipError);
          }
        }
      }

      // 3. Create team members
      const teamMembers = [];
      
      if (onboardingData.team?.cutter) {
        teamMembers.push({
          first_name: onboardingData.team.cutter.split(' ')[0],
          last_name: onboardingData.team.cutter.split(' ').slice(1).join(' '),
          role: 'cutter',
          factory_id: factory.id,
          position: 'Кройщик'
        });
      }

      if (onboardingData.team?.brigadier) {
        teamMembers.push({
          first_name: onboardingData.team.brigadier.split(' ')[0],
          last_name: onboardingData.team.brigadier.split(' ').slice(1).join(' '),
          role: 'brigade_leader',
          factory_id: factory.id,
          position: 'Бригадир'
        });
      }

      if (teamMembers.length > 0) {
        const { error: teamError } = await supabase
          .from('profiles')
          .insert(teamMembers);

        if (teamError) {
          console.error('Error creating team members:', teamError);
        }
      }

      // 4. Create customer and product model
      if (onboardingData.client?.name) {
        // Create customer
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .insert({
            name: onboardingData.client.name,
            factory_id: factory.id
          })
          .select()
          .single();

        if (customerError) {
          console.error('Error creating customer:', customerError);
        }

        // Create product model
        if (onboardingData.client.productName) {
          const { error: productError } = await supabase
            .from('product_models')
            .insert({
              name: onboardingData.client.productName,
              article_number: onboardingData.client.articleNumber,
              factory_id: factory.id,
              category: 'clothing'
            });

          if (productError) {
            console.error('Error creating product model:', productError);
          }
        }
      }

      // 5. Mark onboarding as completed
      const { error: completeError } = await supabase
        .from('factories')
        .update({ has_completed_onboarding: true })
        .eq('id', factory.id);

      if (completeError) {
        throw completeError;
      }

      // Reload profile to get updated factory data
      await loadUserProfile(user.id);

      return { success: true };
    } catch (error) {
      console.error('Error completing onboarding:', error);
      return { error };
    }
  };

  const skipOnboarding = async () => {
    try {
      if (!factory?.id) {
        throw new Error('No factory found');
      }

      const { error } = await supabase
        .from('factories')
        .update({ has_completed_onboarding: true })
        .eq('id', factory.id);

      if (error) throw error;

      // Reload profile to get updated factory data
      await loadUserProfile(user.id);

      return { success: true };
    } catch (error) {
      console.error('Error skipping onboarding:', error);
      return { error };
    }
  };

  const updateProfile = async (updates) => {
    if (!user) return { error: new Error('No user logged in') };

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (!error) {
      setProfile(data);
    }

    return { data, error };
  };

  const isFactoryOwner = () => {
    return profile?.role === 'factory_owner';
  };

  const isSuperAdmin = () => {
    return profile?.role === 'superadmin';
  };

  const hasFactory = () => {
    return !!factory;
  };

  const needsFactorySetup = () => {
    return user && profile && !factory && profile.role !== 'superadmin';
  };

  const needsOnboarding = () => {
    return user && profile && factory && !factory.has_completed_onboarding && profile.role === 'factory_owner';
  };

  const value = {
    user,
    profile,
    factory,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    createFactory,
    completeOnboarding,
    skipOnboarding,
    updateProfile,
    isFactoryOwner,
    isSuperAdmin,
    hasFactory,
    needsFactorySetup,
    needsOnboarding,
    loadUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};