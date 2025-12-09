import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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

  const fetchCouple = async (userId: string) => {
    if (!userId) {
      setCoupleLoading(false);
      return;
    }

    setCoupleLoading(true);
    try {
      const { data: memberData, error: memberError } = await supabase
        .from('couple_members')
        .select('couple_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (memberError) {
        console.error('Error fetching member data:', memberError);
      }

      if (memberData?.couple_id) {
        const { data: coupleData, error: coupleError } = await supabase
          .from('couples')
          .select('id, name')
          .eq('id', memberData.couple_id)
          .single();

        if (coupleError) {
          console.error('Error fetching couple data:', coupleError);
        }

        if (coupleData) {
          setCouple(coupleData);
        }
      } else {
        setCouple(null);
      }
    } catch (err) {
      console.error('Unexpected error in fetchCouple:', err);
    } finally {
      setCoupleLoading(false);
    }
  };

  const createCoupleForUser = async (coupleName: string) => {
    if (!user) return { error: new Error('Usuário não autenticado') };

    const { data, error } = await supabase.rpc('create_family_space', { name: coupleName });

    if (error) return { error };

    const newCouple = data as unknown as { id: string, name: string };
    setCouple({ id: newCouple.id, name: newCouple.name });
    return { error: null };
  };

  const refreshCouple = async () => {
    if (user) {
      await fetchCouple(user.id);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          fetchCouple(session.user.id);
        } else {
          setCouple(null);
        }

        setLoading(false);
        if (session?.user?.email === 'marloncrs79@gmail.com') {
          setPlan('pro');
        }
      }
    );

    return () => subscription.unsubscribe();
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
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setCouple(null);
    setPlan('free');
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
