import React from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

type UserProfile = {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
  role?: string | null;
  updated_at?: string | null;
};

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<any>;
  refreshProfile: () => Promise<void>;
  updateProfile: (payload: Partial<UserProfile>) => Promise<any>;
};

export const AuthContext = React.createContext<AuthContextValue | undefined>(
  undefined,
);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [session, setSession] = React.useState<Session | null>(null);
  const [user, setUser] = React.useState<User | null>(null);
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [loading, setLoading] = React.useState(true);

  const fetchProfile = async (id: string | undefined) => {
    if (!id) {
      setProfile(null);
      return;
    }
    const { data } = await supabase
      .from<UserProfile>("profiles")
      .select("*")
      .eq("id", id)
      .single();
    setProfile(data ?? null);
  };

  React.useEffect(() => {
    // get initial session
    (async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();
      setSession(currentSession ?? null);
      setUser(currentSession?.user ?? null);
      await fetchProfile(currentSession?.user?.id);
      setLoading(false);
    })();

    const { data } = supabase.auth.onAuthStateChange((event, newSession) => {
      // event may be SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, etc.
      setSession(newSession ?? null);
      setUser(newSession?.user ?? null);
      fetchProfile(newSession?.user?.id);
    });

    return () => {
      // unsubscribe
      data.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = (email: string, password: string) => {
    // return promise so caller can handle errors
    return supabase.auth.signInWithPassword({ email, password });
  };

  const signUp = (email: string, password: string) => {
    return supabase.auth.signUp({ email, password });
  };

  const signOut = () => {
    return supabase.auth.signOut();
  };

  const refreshProfile = async () => {
    await fetchProfile(session?.user?.id);
  };

  const updateProfile = async (payload: Partial<UserProfile>) => {
    if (!session?.user?.id) {
      return { error: new Error("Not authenticated") };
    }
    const updates = {
      ...payload,
      id: session.user.id,
      updated_at: new Date().toISOString(),
    };
    return supabase.from("profiles").upsert(updates);
  };

  const value: AuthContextValue = {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};