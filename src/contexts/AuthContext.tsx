import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { clearLocalAuthSession, withTimeout } from "@/lib/auth-session";

type UserRole = "user" | "lawyer" | "admin";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRole: UserRole | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  userRole: null,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const roleRequestRef = useRef(0);

  const fetchRole = async (userId: string) => {
    const requestId = ++roleRequestRef.current;

    try {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      if (requestId !== roleRequestRef.current) return;
      setUserRole((data?.role as UserRole) ?? null);
    } catch {
      if (requestId !== roleRequestRef.current) return;
      setUserRole(null);
    }
  };

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);

      if (nextSession?.user) {
        void fetchRole(nextSession.user.id);
      } else {
        setUserRole(null);
      }
    });

    const initializeSession = async () => {
      try {
        const sessionResult = await withTimeout(
          supabase.auth.getSession(),
          12000,
          "Auth session initialization timeout"
        );

        const {
          data: { session: initialSession },
          error,
        } = sessionResult;

        if (error) throw error;

        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        if (initialSession?.user) {
          void fetchRole(initialSession.user.id);
        } else {
          setUserRole(null);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        console.warn("Session fetch issue:", error);

        // Timeout should not force logout; let user continue and recover naturally.
        if (!message.toLowerCase().includes("timeout")) {
          await clearLocalAuthSession(supabase);
          setSession(null);
          setUser(null);
          setUserRole(null);
        }
      } finally {
        setLoading(false);
      }
    };

    void initializeSession();

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await clearLocalAuthSession(supabase);
    setUser(null);
    setSession(null);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, userRole, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
