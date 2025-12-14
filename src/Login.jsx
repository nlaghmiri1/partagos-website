import { useEffect } from "react";
import { supabase } from "./supabaseClient";

function goTo(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export default function Login() {
  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      const user = data?.session?.user;
      if (!user) return;

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("email", user.email)
        .single();

      if (profile?.role === "admin") {
        goTo("/admin/customers");
      } else {
        goTo("/dashboard");
      }
    }

    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      checkSession();
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function sendMagicLink(e) {
    e.preventDefault();
    const email = e.target.email.value;

    await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: "https://partagos.nl"
      }
    });

    alert("Magic link verzonden.");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <form
        onSubmit={sendMagicLink}
        className="bg-white p-8 rounded-2xl shadow w-[360px]"
      >
        <h1 className="text-xl font-bold mb-4">Inloggen bij Partagos</h1>

        <input
          name="email"
          type="email"
          required
          placeholder="jij@bedrijf.nl"
          className="w-full border rounded-xl px-4 py-2 mb-4"
        />

        <button className="w-full bg-emerald-600 text-white py-2 rounded-xl">
          Stuur magic link
        </button>
      </form>
    </div>
  );
}
