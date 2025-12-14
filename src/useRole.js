import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export function useRole() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        setRole(null);
        setLoading(false);
        return;
      }

      const email = session.session.user.email;

      const { data } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("email", email)
        .single();

      setRole(data?.role || "viewer");
      setLoading(false);
    }

    load();
  }, []);

  return { role, loading };
}
