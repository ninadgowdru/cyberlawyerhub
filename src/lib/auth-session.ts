import { SupabaseClient } from "@supabase/supabase-js";

export const clearAuthStorage = () => {
  if (typeof window === "undefined") return;

  for (const key of Object.keys(window.localStorage)) {
    if (key.startsWith("sb-") && key.endsWith("-auth-token")) {
      window.localStorage.removeItem(key);
    }
  }
};

export const clearLocalAuthSession = async (client: SupabaseClient) => {
  // Do not block on signOut network behavior; clear local state immediately.
  void client.auth.signOut({ scope: "local" }).catch(() => {});
  clearAuthStorage();
};

export const withTimeout = <T>(promise: Promise<T>, ms: number, message: string) => {
  return Promise.race<T>([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms);
    }),
  ]);
};

