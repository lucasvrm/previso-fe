import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../api/supabaseClient';
import { api } from '../api/apiClient';

/* eslint-disable react-refresh/only-export-components */
export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.time('[AuthContext] Total auth initialization');
    
    const fetchUserProfile = async (userId) => {
      if (!userId) {
        setUserRole(null);
        setProfile(null);
        return;
      }
      
      // Strategy: Always try backend /api/profile first for role determination
      // This ensures role is always sourced from backend, not Supabase metadata
      try {
        console.time('[AuthContext] Fetch user profile');
        
        // Get session for API authentication
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          console.error('[AuthContext] Sem sessão ativa');
          setProfile(null);
          setUserRole(null);
          return;
        }
        
        // PRIORITY: Fetch profile from backend API (source of truth for role)
        try {
          const apiProfileData = await api.get('/api/profile');
          
          if (import.meta.env.MODE === 'development') {
            console.debug('[AuthContext] Perfil carregado via API backend:', apiProfileData);
          }
          console.timeEnd('[AuthContext] Fetch user profile');
          
          // Extract role from multiple possible payload formats
          // Supports: { role: 'admin' }, { user_role: 'admin' }, 
          // { data: { role: 'admin' } }, { profile: { role: 'admin' } }
          const extractedRole = apiProfileData?.role || 
                                apiProfileData?.user_role || 
                                apiProfileData?.data?.role || 
                                apiProfileData?.profile?.role || 
                                null;
          
          if (import.meta.env.MODE === 'development') {
            console.debug('[AuthContext] Role extraído:', extractedRole);
          }
          
          // If backend returned 200 OK but no role found, try Supabase fallback
          if (!extractedRole) {
            console.warn('[AuthContext] Backend retornou sucesso mas sem campo role, tentando fallback Supabase...');
            
            const { data: profileData, error: supabaseError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', userId)
              .single();
            
            if (supabaseError) {
              console.error('[AuthContext] Fallback via Supabase também falhou:', supabaseError);
              // Backend succeeded but no role, Supabase also failed - set profile but no role
              setProfile(apiProfileData);
              setUserRole(null);
              return;
            }
            
            if (import.meta.env.MODE === 'development') {
              console.debug('[AuthContext] Perfil carregado via Supabase (fallback):', profileData);
            }
            
            // Merge backend data with Supabase role
            setProfile({ ...apiProfileData, ...profileData });
            setUserRole(profileData?.role || null);
            return;
          }
          
          // Success - backend provided role
          setProfile(apiProfileData);
          setUserRole(extractedRole);
          return; // Success - backend is authoritative
        } catch (apiError) {
          console.error('[AuthContext] Erro ao buscar perfil via API backend:', apiError);
          
          // FALLBACK: If backend fails (network, 500, etc), try Supabase as backup
          // This prevents total failure but backend role should be preferred when available
          if (import.meta.env.MODE === 'development') {
            console.debug('[AuthContext] Tentando fallback: buscar via Supabase...');
          }
          
          const { data: profileData, error: supabaseError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
          
          if (supabaseError) {
            // Both backend and Supabase failed - this is a critical error
            console.error('[AuthContext] Fallback via Supabase também falhou:', supabaseError);
            throw new Error('Não foi possível carregar o perfil do usuário');
          }
          
          if (import.meta.env.MODE === 'development') {
            console.debug('[AuthContext] Perfil carregado via Supabase (fallback):', profileData);
          }
          console.timeEnd('[AuthContext] Fetch user profile');
          
          setProfile(profileData);
          setUserRole(profileData?.role || null);
          return;
        }
      } catch (error) {
        console.error('[AuthContext] Erro ao buscar perfil do usuário:', error.message || error);
        console.error('[AuthContext] ⚠️  ATENÇÃO: Não foi possível carregar o perfil do usuário!');
        console.error('[AuthContext] Possíveis causas:');
        console.error('[AuthContext] 1. Backend /api/profile indisponível ou retornando erro');
        console.error('[AuthContext] 2. Política RLS do Supabase está bloqueando o acesso');
        console.error('[AuthContext] 3. Problemas de rede ou autenticação');
        console.error('[AuthContext] Solução: Verifique o status do backend e políticas RLS');
        
        // Don't loop - set to null and stop trying
        setProfile(null);
        setUserRole(null);
      }
    };
    
    let subscription = null;
    
    const initAuth = async () => {
      console.log('[AuthContext] Starting auth initialization...');
      console.time('[AuthContext] getSession call');
      
      // Get the session from Supabase (uses localStorage internally)
      const { data: { session } } = await supabase.auth.getSession();
      console.timeEnd('[AuthContext] getSession call');
      
      setUser(session?.user ?? null);
      
      // OPTIMIZATION: Set loading to false immediately after getting session
      // This allows the UI to render while profile fetches in parallel
      setLoading(false);
      console.timeEnd('[AuthContext] Total auth initialization');
      
      // Fetch profile in parallel (don't block on it)
      // Profile will update asynchronously when ready
      if (session?.user?.id) {
        fetchUserProfile(session.user.id);
      }

      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          console.log('[AuthContext] Auth state changed:', _event);
          setUser(session?.user ?? null);
          // Fetch profile without blocking (consistent with initial auth flow)
          if (session?.user?.id) {
            fetchUserProfile(session.user.id);
          }
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