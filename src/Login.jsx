import { useState } from "react";
import { supabase } from "./supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function login() {
    setError("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin + "/dashboard",
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-8 rounded-2xl shadow w-full max-w-sm">
        <h2 className="text-xl font-bold mb-2">Inloggen</h2>
        <p className="text-sm text-slate-500 mb-4">
          Ontvang een magische login-link per e-mail
        </p>

        {sent ? (
          <p className="text-emerald-600 text-sm">
            Check je e-mail voor de login-link.
          </p>
        ) : (
          <>
            <input
              type="email"
              placeholder="jij@bedrijf.nl"
              className="w-full border rounded-xl px-4 py-2 mb-3"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {error && (
              <p className="text-red-600 text-sm mb-2">{error}</p>
            )}

            <button
              onClick={login}
              className="w-full bg-emerald-600 text-white py-2 rounded-xl"
            >
              Stuur login-link
            </button>
          </>
        )}
      </div>
    </div>
  );
}
