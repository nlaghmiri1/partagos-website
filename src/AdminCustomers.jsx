import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";

function goTo(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export default function AdminCustomers() {
  const [sessionLoading, setSessionLoading] = useState(true);
  const [emailMe, setEmailMe] = useState("");
  const [myRole, setMyRole] = useState(null);

  const [companyName, setCompanyName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [packageName, setPackageName] = useState("starter");
  const [role, setRole] = useState("admin");
  const [redirectTo, setRedirectTo] = useState("https://partagos.nl/dashboard");

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const [companies, setCompanies] = useState([]);
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      const user = data?.session?.user;
      if (!user) {
        goTo("/login");
        return;
      }
      setEmailMe(user.email || "");
      setSessionLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!emailMe) return;
    (async () => {
      // We bepalen admin-rechten op basis van user_profiles (data layer)
      const { data } = await supabase.from("user_profiles").select("role").eq("email", emailMe).single();
      setMyRole(data?.role || "viewer");
    })();
  }, [emailMe]);

  useEffect(() => {
    if (!emailMe) return;
    (async () => {
      const { data } = await supabase.from("companies").select("*").order("created_at", { ascending: false });
      setCompanies(data || []);
    })();
  }, [emailMe, reloadTick]);

  const isAdmin = useMemo(() => myRole === "admin", [myRole]);

  async function provisionCustomer() {
    setResult(null);

    if (!isAdmin) {
      setResult({ ok: false, error: "Geen toegang: admin rol vereist." });
      return;
    }

    if (!companyName.trim()) {
      setResult({ ok: false, error: "Bedrijfsnaam is verplicht." });
      return;
    }

    if (!customerEmail.trim()) {
      setResult({ ok: false, error: "E-mail is verplicht." });
      return;
    }

    setSubmitting(true);
    try {
      const resp = await fetch("/api/provision-customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: companyName.trim(),
          email: customerEmail.trim(),
          packageName,
          role,
          redirectTo,
        }),
      });

      const json = await resp.json();
      setResult(json);

      if (json.ok) {
        setCompanyName("");
        setCustomerEmail("");
        setPackageName("starter");
        setRole("admin");
        setReloadTick((x) => x + 1);
      }
    } catch (e) {
      setResult({ ok: false, error: e?.message || String(e) });
    } finally {
      setSubmitting(false);
    }
  }

  if (sessionLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-100">Laden…</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-slate-900">Admin — Nieuwe klant aanmaken</div>
            <div className="text-sm text-slate-500">Invite-only onboarding: jij provisiont accounts.</div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => goTo("/dashboard")}
              className="text-sm px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50"
            >
              Terug naar dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-base font-semibold text-slate-900">Provision customer</div>
              <div className="text-sm text-slate-500">
                Maak bedrijf + user_profile aan en verstuur automatisch een Supabase invite (magic link).
              </div>
              <div className="text-xs text-slate-400 mt-2">
                Ingelogd als: <span className="font-mono">{emailMe}</span> • rol: <span className="font-mono">{myRole || "-"}</span>
              </div>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full border ${isAdmin ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
              {isAdmin ? "Admin enabled" : "Admin required"}
            </span>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Bedrijfsnaam">
              <input className="w-full border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-200"
                value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Autosloop XYZ" />
            </Field>

            <Field label="Klant e-mail (login)">
              <input className="w-full border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-200"
                value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="info@bedrijf.nl" />
            </Field>

            <Field label="Pakket">
              <select className="w-full border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-200"
                value={packageName} onChange={(e) => setPackageName(e.target.value)}>
                <option value="starter">starter</option>
                <option value="growth">growth</option>
                <option value="scale">scale</option>
              </select>
            </Field>

            <Field label="Rol (eerste gebruiker)">
              <select className="w-full border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-200"
                value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="admin">admin</option>
                <option value="warehouse">warehouse</option>
                <option value="sales">sales</option>
                <option value="viewer">viewer</option>
              </select>
            </Field>

            <Field label="Redirect na login">
              <input className="w-full border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-200"
                value={redirectTo} onChange={(e) => setRedirectTo(e.target.value)} />
              <div className="text-xs text-slate-500 mt-1">Standaard: https://partagos.nl/dashboard</div>
            </Field>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              onClick={provisionCustomer}
              disabled={!isAdmin || submitting}
              className={`px-5 py-2 rounded-xl font-medium ${(!isAdmin || submitting) ? "bg-slate-200 text-slate-500" : "bg-emerald-600 hover:bg-emerald-700 text-white"}`}
            >
              {submitting ? "Aanmaken & uitnodigen…" : "Klant aanmaken + invite sturen"}
            </button>
            <button
              type="button"
              onClick={() => setResult(null)}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm"
            >
              Reset status
            </button>
          </div>

          {result && (
            <div className={`mt-4 rounded-xl border p-4 text-sm ${result.ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800"}`}>
              <pre className="whitespace-pre-wrap break-words">{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="text-base font-semibold text-slate-900">Bestaande bedrijven</div>
          <div className="text-sm text-slate-500">Controleer of package correct wordt opgeslagen.</div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-500 border-b">
                <tr>
                  <th className="py-2 pr-4">Bedrijf</th>
                  <th className="py-2 pr-4">Pakket</th>
                  <th className="py-2 pr-4">Aangemaakt</th>
                  <th className="py-2 pr-4">ID</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((c) => (
                  <tr key={c.id} className="border-b last:border-0">
                    <td className="py-2 pr-4 font-medium text-slate-900">{c.name}</td>
                    <td className="py-2 pr-4">{c.package}</td>
                    <td className="py-2 pr-4">{c.created_at ? new Date(c.created_at).toLocaleString() : "-"}</td>
                    <td className="py-2 pr-4 font-mono text-xs">{c.id}</td>
                  </tr>
                ))}
                {companies.length === 0 && (
                  <tr><td colSpan={4} className="py-6 text-center text-slate-500">Geen bedrijven gevonden.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <div className="text-xs text-slate-600 mb-1">{label}</div>
      {children}
    </label>
  );
}
