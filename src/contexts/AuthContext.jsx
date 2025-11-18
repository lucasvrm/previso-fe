import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../api/supabaseClient';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const fetchUserProfile = async (userId) => {
      if (!userId) {
        setUserRole(null);
        setProfile(null);
        return;
      }
      try {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        if (error) throw error;
        setProfile(profileData);
        setUserRole(profileData?.role || null);
      } catch (error) {
        console.error('Erro ao buscar perfil do usuário:', error.message);
        setProfile(null);
        setUserRole(null);
      }
    };
    
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      await fetchUserProfile(session?.user?.id);
      setLoading(false);

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          setUser(session?.user ?? null);
          await fetchUserProfile(session?.user?.id);
          setLoading(false);
        }
      );
      
      return subscription;
    });

    return () => {};
  }, []);

  const signUp = async (email, password, role = 'patient') => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({ 
        email, 
        password 
      });
      
      if (authError) {
        return { error: authError.message };
      }
      
      if (authData.user) {
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({ 
              id: authData.user.id, 
              role: role, 
              email: email 
            });
          
          if (profileError) {
            console.error('Erro ao criar perfil:', profileError);
            return { 
              error: 'Erro ao criar perfil do usuário. Por favor, contate o suporte.' 
            };
          }
        } catch (err) {
          console.error('Erro inesperado ao criar perfil:', err);
          return { 
            error: 'Erro ao criar perfil do usuário. Por favor, contate o suporte.' 
          };
        }
      }
      
      return { 
        data: authData,
        message: 'Conta criada com sucesso. Verifique seu e-mail para confirmar.'
      };
    } catch (err) {
      console.error('Erro inesperado no signup:', err);
      return { error: 'Erro inesperado ao criar conta. Por favor, tente novamente.' };
    }
  };

  const value = {
    user,
    profile,
    userRole,
    loading,
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    signUp,
    signOut: () => supabase.auth.signOut(),
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}