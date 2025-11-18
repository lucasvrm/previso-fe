// src/contexts/AuthContext.jsx
import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { supabase } from "../api/supabaseClient.js";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Carrega o perfil do usuário na tabela `profiles`
  const fetchProfile = useCallback(async (userId, email) => {
    console.log("[Auth] fetchProfile para", userId, email);

    if (!userId) {
      setProfile(null);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.warn("[Auth] erro ao carregar perfil:", error.message);
      setProfile(null);
      return;
    }

    setProfile(data);
  }, []);

  // Inicializa sessão e subscribe nos eventos de auth
  useEffect(() => {
    const init = async () => {
      console.log("[Auth] init() - buscando sessão inicial");
      setAuthLoading(true);

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("[Auth] erro em getSession:", error.message);
        setAuthError(error.message);
        setUser(null);
        setProfile(null);
        setAuthLoading(false);
        return;
      }

      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id, session.user.email);
      } else {
        setUser(null);
        setProfile(null);
      }

      setAuthLoading(false);
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[Auth] onAuthStateChange:", event, session);

      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id, session.user.email);
      }

      if (event === "SIGNED_OUT") {
        setUser(null);
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // LOGIN
  const signIn = async (email, password) => {
    console.log("[Auth] signIn chamado para", email);
    setAuthError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("[Auth] erro em signIn:", error.message);
      setAuthError(error.message);
      return { error: error.message };
    }

    const session = data.session;
    const loggedUser = session?.user ?? data.user;

    if (loggedUser) {
      setUser(loggedUser);
      await fetchProfile(loggedUser.id, loggedUser.email);
      return { user: loggedUser };
    }

    return { error: "Falha ao entrar. Tente novamente." };
  };

  // SIGNUP
  const signUp = async (email, password, extraProfile = {}) => {
    console.log("[Auth] signUp chamado para", email);
    setAuthError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error("[Auth] erro em signUp:", error.message);
      setAuthError(error.message);
      return { error: error.message };
    }

    const newUser = data.user;

    if (newUser) {
      const { error: profileError } = await supabase.from("profiles").upsert({
        user_id: newUser.id,
        email,
        ...extraProfile,
        updated_at: new Date().toISOString(),
      });

      if (profileError) {
        console.error("[Auth] erro ao salvar perfil:", profileError.message);
      }

      setUser(newUser);
      await fetchProfile(newUser.id, newUser.email);
      return { user: newUser };
    }

    return { error: "Falha ao criar conta. Verifique seu e-mail." };
  };

  // LOGOUT
  const signOut = async () => {
    console.log("[Auth] signOut chamado");
    setAuthError(null);

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("[Auth] erro em signOut:", error.message);
      setAuthError(error.message);
      return { error: error.message };
    }

    setUser(null);
    setProfile(null);
    return { success: true };
  };

  const value = {
    user,
    profile,
    authLoading,
    authError,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
