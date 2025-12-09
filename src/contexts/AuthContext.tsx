import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface CoupleData {
  id: string;
  name: string;
}

export type PlanType = 'free' | 'pro' | 'annual';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  couple: CoupleData | null;
  plan: PlanType;
  loading: boolean;
  coupleLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, coupleName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshCouple: () => Promise<void>;
  createCoupleForUser: (coupleName: string) => Promise<{ error: Error | null }>;
  updatePlan: (newPlan: PlanType) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [couple, setCouple] = useState<CoupleData | null>(null);
  const [plan, setPlan] = useState<PlanType>('free');
  const [loading, setLoading] = useState(true);
  const [coupleLoading, setCoupleLoading] = useState(true);

  // Prevent double-fetching
  const fetchingRef = useRef(false);
  const lastFetchedUserId = useRef<string | null>(null);

  // Load plan from local storage on mount
  useEffect(() => {
    const savedPlan = localStorage.getItem('pig_plan');
    if (savedPlan && (savedPlan === 'free' || savedPlan === 'pro' || savedPlan === 'annual')) {
      setPlan(savedPlan as PlanType);
    }
  }, []);

  const updatePlan = (newPlan: PlanType) => {
    setPlan(newPlan);
    localStorage.setItem('pig_plan', newPlan);
  };

  const fetchCouple = async (userId: string, force = false) => {
    // Prevent concurrent fetches for the same user
    if (!userId) {
      setCoupleLoading(false);
      return;
    }

    // Skip if already fetching or already fetched for this user (unless forced)
    if (fetchingRef.current) {
      console.log('[AuthContext] Skipping fetch - already in progress');
      return;
    }

    if (!force && lastFetchedUserId.current === userId && couple !== null) {
      console.log('[AuthContext] Skipping fetch - already fetched for this user');
      setCoupleLoading(false);
      return;
    }

    fetchingRef.current = true;
    setCoupleLoading(true);

    console.log('[AuthContext] Fetching couple for user:', userId);

    try {
      const { data: memberData, error: memberError } = await supabase
        .from('couple_members')
        .select('couple_id')
        .eq('user_id', userId)
        .maybeSingle();

      console.log('[AuthContext] Member query result:', { memberData, memberError });

      if (memberError) {
        console.error('[AuthContext] Error fetching member data:', memberError);
        setCouple(null);
      } else if (memberData?.couple_id) {
        const { data: coupleData, error: coupleError } = await supabase
          .from('couples')
          .select('id, name')
          .eq('id', memberData.couple_id)
          .single();

        console.log('[AuthContext] Couple query result:', { coupleData, coupleError });

        if (coupleError) {
          console.error('[AuthContext] Error fetching couple data:', coupleError);
          setCouple(null);
        } else if (coupleData) {
          setCouple(coupleData);
          lastFetchedUserId.current = userId;
        }
      } else {
        console.log('[AuthContext] No membership found for user');
        setCouple(null);
      }
    } catch (err) {
      console.error('[AuthContext] Unexpected error in fetchCouple:', err);
      setCouple(null);
    } finally {
      fetchingRef.current = false;
      setCoupleLoading(false);
    }
  };

  const createCoupleForUser = async (coupleName: string) => {
    if (!user) return { error: new Error('Usuário não autenticado') };

    console.log('[AuthContext] Creating couple:', coupleName);
    const { data, error } = await supabase.rpc('create_family_space', { name: coupleName });

    if (error) {
      console.error('[AuthContext] Error creating couple:', error);
      return { error };
    }

    console.log('[AuthContext] Couple created:', data);
    const newCouple = data as unknown as { id: string, name: string };
    setCouple({ id: newCouple.id, name: newCouple.name });
    lastFetchedUserId.current = user.id;
    return { error: null };
  };

  const refreshCouple = async () => {
    if (user) {
      lastFetchedUserId.current = null; // Force refresh
      await fetchCouple(user.id, true);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Only use onAuthStateChange - it fires immediately with current session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('[AuthContext] Auth state changed:', event, session?.user?.id);

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Use setTimeout to avoid Supabase internal deadlock
          setTimeout(() => {
            if (mounted) {
              fetchCouple(session.user.id);
            }
          }, 50); // Small delay to ensure RLS sees the data

          // Admin override
          if (session.user.email === 'marloncrs79@gmail.com') {
            setPlan('pro');
          }
        } else {
          setCouple(null);
          setCoupleLoading(false);
          lastFetchedUserId.current = null;
        }

        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Monitor user changes to enforce admin rights
  useEffect(() => {
    if (user?.email === 'marloncrs79@gmail.com') {
      setPlan('pro');
    }
  }, [user]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, coupleName: string) => {
    const redirectUrl = `${window.location.origin}/`;

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });

    if (authError) return { error: authError };

    if (authData.user) {
      const { data, error: coupleError } = await supabase.rpc('create_family_space', { name: coupleName });

      if (coupleError) return { error: coupleError };

      const newCouple = data as unknown as { id: string, name: string };
      setCouple(newCouple);
      lastFetchedUserId.current = authData.user.id;
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setCouple(null);
    setPlan('free');
    lastFetchedUserId.current = null;
    localStorage.removeItem('pig_plan');
  };

  return (
    <AuthContext.Provider value={{ user, session, couple, plan, loading, coupleLoading, signIn, signUp, signOut, refreshCouple, createCoupleForUser, updatePlan }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
