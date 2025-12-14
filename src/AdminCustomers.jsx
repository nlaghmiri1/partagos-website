import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

function goTo(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export default function AdminCustomers() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState(null);

  const [form, setForm] = useState({
    companyName: "",
    package: "starter",
    adminEmail: ""
  });

  const [result, setResult] = useState(null);

  useEffect(() => {
    async function boot() {
      const { data } = await supabase.auth.getSession();
      const user = data?.session?.user;
      if (!user) {
        goTo("/login");
        return;
      }
      setEmail(user.email);

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("email", user.email)
        .single();

      const ok = profile?.role === "admin";
      setIsAdmin(ok);
      setLoading(false);

      if (!ok) {
        // hard-block
        goTo("/dashboard");
      }
    }

    boot();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    goTo("/login");
  }

  async function createCustomer(e) {
    e.preventDefault();
    setResult(null);

    if (!form.companyName.trim() || !form.adminEmail.trim()) {
      setResult({ ok: false, error: "Vul bedrijfsnaam en admin e-mail in." });
      return;
    }

    const resp = await fetch("/api/admin/createCustomer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_name: form.companyName.trim(),
        package: form.package,
        admin_email: form.adminEmail.trim()
      })
    });

    const json = await resp.json();
    setResult(json);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Laden…</div>;

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <div className="font-bold text-lg">Admin</div>
            <div className="text-xs text-slate-500">{email}</div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => goTo("/dashboard")} className="px-4 py-2 rounded-xl border bg-white">
              Naar dashboard
            </button>
            <button onClick={logout} className="px-4 py-2 rounded-xl bg-slate-900 text-white">
              Uitloggen
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        <div className="bg-white border rounded-2xl p-6">
          <h1 className="text-2xl font-bold">Nieuwe klant aanmaken</h1>
          <p className="text-sm text-slate-600 mt-1">
            Maakt een company aan, koppelt de admin gebruiker via user_profiles en stuurt een invite (magic link) via Supabase Admin API.
          </p>

          <form onSubmit={createCustomer} className="mt-6 grid gap-3">
            <div>
              <label className="text-sm font-semibold">Bedrijfsnaam</label>
              <input
                className="w-full border rounded-xl px-4 py-2 mt-1"
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                placeholder="Bijv. Partagos Demo BV"
              />
            </div>

            <div>
              <label className="text-sm font-semibold">Pakket</label>
              <select
                className="w-full border rounded-xl px-4 py-2 mt-1"
                value={form.package}
                onChange={(e) => setForm({ ...form, package: e.target.value })}
              >
                <option value="starter">starter</option>
                <option value="growth">growth</option>
                <option value="scale">scale</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold">Admin e-mail klant</label>
              <input
                className="w-full border rounded-xl px-4 py-2 mt-1"
                value={form.adminEmail}
                onChange={(e) => setForm({ ...form, adminEmail: e.target.value })}
                placeholder="klant@bedrijf.nl"
              />
            </div>

            <button className="mt-2 px-5 py-3 rounded-xl bg-emerald-600 text-white font-semibold">
              Klant aanmaken + invite versturen
            </button>
          </form>

          {result && (
            <div className={`mt-5 rounded-xl border p-4 text-sm ${result.ok ? "bg-emerald-50" : "bg-red-50"}`}>
              <pre className="whitespace-pre-wrap break-words">{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
