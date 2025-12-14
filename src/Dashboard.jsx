import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import Labels from "./Labels";

function goTo(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function NavBtn({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm ${
        active ? "bg-emerald-600 text-white" : "bg-white border"
      }`}
    >
      {label}
    </button>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white border rounded-2xl p-5">
      <div className="text-lg font-bold mb-3">{title}</div>
      {children}
    </div>
  );
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  const [profile, setProfile] = useState(null);
  const [company, setCompany] = useState(null);
  const [features, setFeatures] = useState({
    canUseLabels: false,
    canUseMarketplaces: false,
  });

  const [tab, setTab] = useState("products");

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // --------------------------------------------------
  // BOOT
  // --------------------------------------------------
  useEffect(() => {
    boot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function boot() {
    setLoading(true);

    const { data } = await supabase.auth.getSession();
    const sess = data?.session;
    if (!sess) {
      goTo("/login");
      return;
    }
    setSession(sess);

    // profiel
    const { data: prof, error: profErr } = await supabase
      .from("user_profiles")
      .select("email, role, company_id")
      .eq("email", sess.user.email)
      .single();

    if (profErr || !prof) {
      alert("Geen profiel gevonden.");
      await supabase.auth.signOut();
      goTo("/login");
      return;
    }
    setProfile(prof);

    // platform admin mag dashboard zien, maar heeft geen company nodig
    if (prof.role === "platform_admin") {
      setCompany(null);
      setFeatures({
        canUseLabels: false,
        canUseMarketplaces: false,
      });
      setLoading(false);
      return;
    }

    // company vereist voor klanten
    if (!prof.company_id) {
      alert("Geen bedrijf gekoppeld.");
      await supabase.auth.signOut();
      goTo("/login");
      return;
    }

    // company laden
    const { data: comp, error: compErr } = await supabase
      .from("companies")
      .select("*")
      .eq("id", prof.company_id)
      .single();

    if (compErr || !comp) {
      alert("Bedrijf niet gevonden.");
      await supabase.auth.signOut();
      goTo("/login");
      return;
    }
    setCompany(comp);

    // features op basis van package
    const pkg = comp.package || "starter";
    setFeatures({
      canUseLabels: pkg === "growth" || pkg === "scale",
      canUseMarketplaces: pkg === "growth" || pkg === "scale",
    });

    await loadProducts(comp.id);
    setLoading(false);
  }

  async function loadProducts(companyId) {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }
    setProducts(data || []);
    setSelectedProduct(data?.[0] || null);
  }

  async function logout() {
    await supabase.auth.signOut();
    goTo("/login");
  }

  // --------------------------------------------------
  // RENDER STATES
  // --------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-600">
        Laden…
      </div>
    );
  }

  // --------------------------------------------------
  // PLATFORM ADMIN VIEW (geen company)
  // --------------------------------------------------
  if (profile?.role === "platform_admin") {
    return (
      <div className="min-h-screen bg-slate-100">
        <header className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div>
              <div className="font-bold">Platform Admin</div>
              <div className="text-xs text-slate-500">{profile.email}</div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => goTo("/admin/customers")}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white"
              >
                Klanten beheren
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white"
              >
                Uitloggen
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-10">
          <Card title="Welkom">
            <p className="text-slate-600">
              Je bent ingelogd als <strong>platform admin</strong>.  
              Gebruik “Klanten beheren” om bedrijven en accounts aan te maken.
            </p>
          </Card>
        </main>
      </div>
    );
  }

  // --------------------------------------------------
  // COMPANY DASHBOARD
  // --------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <div className="font-bold">{company?.name}</div>
            <div className="text-xs text-slate-500">
              {profile.role} • pakket: {company?.package}
            </div>
          </div>
          <div className="flex gap-2">
            {profile.role === "company_admin" && (
              <button
                onClick={() => alert("Gebruikersbeheer komt hier")}
                className="px-4 py-2 rounded-xl border bg-white"
              >
                Gebruikers
              </button>
            )}
            <button
              onClick={logout}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white"
            >
              Uitloggen
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-5">
        {/* NAV */}
        <div className="flex flex-wrap gap-2">
          <NavBtn label="Onderdelen" active={tab === "products"} onClick={() => setTab("products")} />
          {features.canUseLabels && (
            <NavBtn label="Labels" active={tab === "labels"} onClick={() => setTab("labels")} />
          )}
          {features.canUseMarketplaces && (
            <NavBtn label="Marketplaces" active={tab === "marketplaces"} onClick={() => setTab("marketplaces")} />
          )}
          <NavBtn label="Instellingen" active={tab === "settings"} onClick={() => setTab("settings")} />
        </div>

        {/* TAB: PRODUCTS */}
        {tab === "products" && (
          <Card title="Onderdelen">
            {products.length === 0 ? (
              <div className="text-slate-600 text-sm">Nog geen onderdelen.</div>
            ) : (
              <div className="grid md:grid-cols-[320px_1fr] gap-4">
                <div className="border rounded-xl overflow-hidden">
                  {products.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedProduct(p)}
                      className={`w-full text-left px-3 py-2 border-b ${
                        selectedProduct?.id === p.id ? "bg-emerald-50" : "bg-white"
                      }`}
                    >
                      <div className="font-semibold text-sm">{p.name}</div>
                      <div className="text-xs text-slate-500">{p.part_number}</div>
                    </button>
                  ))}
                </div>

                <div className="border rounded-xl p-4 bg-white">
                  {selectedProduct ? (
                    <>
                      <div className="font-bold">{selectedProduct.name}</div>
                      <div className="text-sm text-slate-600 mt-1">
                        PN: {selectedProduct.part_number}
                      </div>
                      <div className="text-xs text-slate-500 mt-2">
                        Motor: {selectedProduct.engine_code || "—"} • Bak:{" "}
                        {selectedProduct.gearbox_code || "—"}
                      </div>
                    </>
                  ) : (
                    <div className="text-slate-600 text-sm">Selecteer een onderdeel.</div>
                  )}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* TAB: LABELS */}
        {tab === "labels" && features.canUseLabels && (
          <Card title="Labels">
            <Labels company={company} selectedProduct={selectedProduct} />
          </Card>
        )}

        {/* TAB: MARKETPLACES */}
        {tab === "marketplaces" && features.canUseMarketplaces && (
          <Card title="Marketplaces">
            <div className="text-sm text-slate-600">
              Marketplace publishing wordt hier beheerd.
            </div>
          </Card>
        )}

        {/* TAB: SETTINGS */}
        {tab === "settings" && (
          <Card title="Instellingen">
            <div className="text-sm text-slate-600">
              Bedrijfsinstellingen en voorkeuren.
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
