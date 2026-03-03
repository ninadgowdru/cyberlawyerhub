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
  try {
    await client.auth.signOut({ scope: "local" });
  } catch {
    // Ignore - we'll still clear local storage keys below.
  }

  clearAuthStorage();
};
