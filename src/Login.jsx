import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

function goTo(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export default function Login() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function check() {
      const { data } = await supabase.auth.getSession();
      const user = data?.session?.user;
      if (!user) return;

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("email", user.email)
        .single();

      if (profile?.role === "admin") goTo("/admin/customers");
      else goTo("/dashboard");
    }

    check();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      check();
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function sendMagicLink(e) {
    e.preventDefault();
    const email = e.target.email.value;
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: "https://partagos.nl"
      }
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }
    alert("Magic link verstuurd. Check je mail.");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <form onSubmit={sendMagicLink} className="bg-white p-8 rounded-2xl shadow w-[380px]">
        <h1 className="text-xl font-bold">Inloggen bij Partagos</h1>
        <p className="text-sm text-slate-600 mt-2">
          Invite-only. Accounts worden door Partagos aangemaakt.
        </p>

        <input
          name="email"
          type="email"
          required
          placeholder="jij@bedrijf.nl"
          className="w-full border rounded-xl px-4 py-2 mt-5"
        />

        <button
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-xl mt-4 font-semibold"
        >
          {loading ? "Versturen…" : "Stuur magic link"}
        </button>

        <button
          type="button"
          onClick={() => (window.location.href = "/")}
          className="w-full border py-2 rounded-xl mt-3"
        >
          Terug naar home
        </button>
      </form>
    </div>
  );
}
