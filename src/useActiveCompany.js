import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export function useActiveCompany() {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: session } = await supabase.auth.getSession();
      const email = session?.session?.user?.email;
      if (!email) {
        setLoading(false);
        return;
      }

      const { data: profiles } = await supabase
        .from("user_profiles")
        .select("company_id, companies(*)")
        .eq("email", email);

      if (profiles && profiles.length > 0) {
        setCompany(profiles[0].companies); // auto-select eerste
      }

      setLoading(false);
    }

    load();
  }, []);

  return { company, loading };
}
