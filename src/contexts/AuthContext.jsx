import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../api/supabaseClient';

/* eslint-disable react-refresh/only-export-components */
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
        if (error) {
          console.error('[AuthContext] Erro ao buscar perfil via Supabase:', error);
          console.log('[AuthContext] Tentando fallback: buscar via API...');
          
          // Fallback: Try to fetch via API endpoint to bypass RLS
          try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            
            if (sessionError || !session) {
              throw new Error('Sem sessão ativa');
            }
            
            // Import getApiUrl at the top or inline it here
            const apiUrl = import.meta.env.VITE_API_URL || 'https://bipolar-engine.onrender.com';
            const endpoint = `${apiUrl}/api/profile`;
            
            const response = await fetch(endpoint, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
              }
            });
            
            if (!response.ok) {
              throw new Error(`API retornou ${response.status}`);
            }
            
            const apiProfileData = await response.json();
            console.log('[AuthContext] Perfil carregado via API:', apiProfileData);
            setProfile(apiProfileData);
            setUserRole(apiProfileData?.role || null);
            return;
          } catch (apiError) {
            console.error('[AuthContext] Fallback via API também falhou:', apiError);
            throw error; // Throw original Supabase error
          }
        }
        console.log('[AuthContext] Perfil carregado via Supabase:', profileData);
        setProfile(profileData);
        setUserRole(profileData?.role || null);
      } catch (error) {
        console.error('[AuthContext] Erro ao buscar perfil do usuário:', error.message || error);
        setProfile(null);
        setUserRole(null);
      }
    };
    
    let subscription = null;
    
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      await fetchUserProfile(session?.user?.id);
      setLoading(false);

      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          setUser(session?.user ?? null);
          await fetchUserProfile(session?.user?.id);
        }
      );
      
      subscription = authListener.subscription;
    };
    
    initAuth();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
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
          // Use upsert instead of insert to handle cases where the backend trigger
          // already created the profile (avoids 409 conflict errors)
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({ 
              id: authData.user.id, 
              role: role, 
              email: email 
            }, {
              onConflict: 'id'
            });
          
          if (profileError) {
            console.error('Erro ao criar/atualizar perfil:', profileError);
            // If it's a 409 conflict that still somehow happened, provide a clearer message
            if (profileError.code === '23505' || profileError.message?.includes('duplicate')) {
              return { 
                error: 'Perfil já existe. Por favor, faça login.' 
              };
            }
            return { 
              error: 'Erro ao configurar perfil do usuário. Por favor, contate o suporte.' 
            };
          }

          // CRITICAL FIX: After successfully updating the profile role,
          // fetch the updated profile and update local state immediately
          // This ensures the UI reflects the correct role (therapist/patient)
          try {
            const { data: updatedProfile, error: fetchError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', authData.user.id)
              .single();
            
            if (!fetchError && updatedProfile) {
              setProfile(updatedProfile);
              setUserRole(updatedProfile.role);
            }
          } catch (fetchErr) {
            console.error('Erro ao buscar perfil atualizado:', fetchErr);
            // Don't fail the signup if we can't fetch the profile
            // The onAuthStateChange listener will handle it eventually
          }
        } catch (err) {
          console.error('Erro inesperado ao criar perfil:', err);
          return { 
            error: 'Erro ao configurar perfil do usuário. Por favor, contate o suporte.' 
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

  const signOut = async () => {
    try {
      // Clear local state first
      setUser(null);
      setProfile(null);
      setUserRole(null);
      
      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Erro ao fazer logout:', error);
        // Even if there's an error, we've cleared local state, so logout is successful
      }
    } catch (err) {
      console.error('Erro inesperado no logout:', err);
      // Even if there's an error, we've cleared local state
    }
  };

  const value = {
    user,
    profile,
    userRole,
    loading,
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    signUp,
    signOut,
    logout: signOut, // Use the same function for both
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}