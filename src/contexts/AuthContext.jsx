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
    updateProfile,
    isFactoryOwner,
    isSuperAdmin,
    hasFactory,
    needsFactorySetup,
    loadUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};