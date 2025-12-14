import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";
import { featuresForPackage } from "./permissions";
import LabelDesigner from "./LabelDesigner";

/* ---------------- helpers ---------------- */

function goTo(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function safeArray(v) {
  return Array.isArray(v) ? v : [];
}

/* ---------------- component ---------------- */

export default function Dashboard() {
  const [sessionLoading, setSessionLoading] = useState(true);
  const [userEmail, setUserEmail] = useState(null);

  const [companies, setCompanies] = useState([]);
  const [activeCompany, setActiveCompany] = useState(null);

  const [role, setRole] = useState(null);
  const [tab, setTab] = useState("products");

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  /* Decoder */
  const [kenteken, setKenteken] = useState("");
  const [rdwResult, setRdwResult] = useState(null);
  const [rdwLoading, setRdwLoading] = useState(false);

  /* Marketplace jobs */
  const [jobs, setJobs] = useState([]);

  /* Product form */
  const [productForm, setProductForm] = useState({
    name: "",
    part_number: "",
    engine_code: "",
    gearbox_code: "",
    location: "",
    price: "",
    stock: 1
  });

  /* ---------------- AUTH ---------------- */

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const user = data?.session?.user;
      if (!user) {
        goTo("/login");
        return;
      }
      setUserEmail(user.email);
      setSessionLoading(false);
    });
  }, []);

  /* ---------------- LOAD COMPANY + ROLE ---------------- */

  useEffect(() => {
    if (!userEmail) return;

    async function loadProfile() {
      const { data: profiles } = await supabase
        .from("user_profiles")
        .select("role, company_id, companies(*)")
        .eq("email", userEmail);

      const list = safeArray(profiles);
      if (list.length === 0) return;

      setRole(list[0].role);
      setCompanies(list.map(p => p.companies));
      setActiveCompany(list[0].companies);
    }

    loadProfile();
  }, [userEmail]);

  /* ---------------- FEATURES ---------------- */

  const features = useMemo(
    () => featuresForPackage(activeCompany?.package),
    [activeCompany]
  );

  /* ---------------- LOAD PRODUCTS ---------------- */

  useEffect(() => {
    if (!activeCompany) return;

    async function loadProducts() {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("company_id", activeCompany.id)
        .order("created_at", { ascending: false });

      setProducts(safeArray(data));
    }

    loadProducts();
  }, [activeCompany]);

  /* ---------------- ACTIONS ---------------- */

  async function addProduct() {
    if (!productForm.name || !activeCompany) return;

    await supabase.from("products").insert([{
      company_id: activeCompany.id,
      ...productForm,
      price: productForm.price ? Number(productForm.price) : null,
      stock: Number(productForm.stock) || 1
    }]);

    setProductForm({
      name: "",
      part_number: "",
      engine_code: "",
      gearbox_code: "",
      location: "",
      price: "",
      stock: 1
    });

    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("company_id", activeCompany.id)
      .order("created_at", { ascending: false });

    setProducts(safeArray(data));
  }

  async function rdwLookup() {
    if (!kenteken) return;

    setRdwLoading(true);
    setRdwResult(null);

    try {
      const r = await fetch(
        `/api/rdw/lookup?kenteken=${encodeURIComponent(kenteken)}`
      );
      const json = await r.json();
      setRdwResult(json);
    } catch (e) {
      setRdwResult({ ok: false, error: e.message });
    } finally {
      setRdwLoading(false);
    }
  }

  async function enqueuePublish(marketplace, product) {
    await fetch("/api/publish/enqueue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_id: activeCompany.id,
        marketplace,
        product_id: product.id
      })
    });

    const { data } = await supabase
      .from("publish_jobs")
      .select("*")
      .eq("company_id", activeCompany.id)
      .order("created_at", { ascending: false });

    setJobs(safeArray(data));
  }

  async function logout() {
    await supabase.auth.signOut();
    goTo("/login");
  }

  /* ---------------- RENDER GUARDS ---------------- */

  if (sessionLoading) {
    return <div className="min-h-screen flex items-center justify-center">Laden…</div>;
  }

  if (!activeCompany) {
    return <div className="p-6">Geen bedrijf gevonden.</div>;
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-5 font-bold text-xl border-b border-slate-700">
          Partagos
        </div>

        <nav className="flex-1 p-3 space-y-1 text-sm">
          <NavBtn label="Onderdelen" active={tab === "products"} onClick={() => setTab("products")} />
          {features.canUseLabels && <NavBtn label="Labels" active={tab === "labels"} onClick={() => setTab("labels")} />}
          <NavBtn label="Decoder" active={tab === "decoder"} onClick={() => setTab("decoder")} />
          {features.canUseMarketplaces && <NavBtn label="Marketplaces" active={tab === "marketplaces"} onClick={() => setTab("marketplaces")} />}
        </nav>

        <div className="p-4 border-t border-slate-700 text-xs">
          <div>{activeCompany.name}</div>
          <div>Pakket: <b>{activeCompany.package}</b></div>
          <button onClick={logout} className="mt-3 w-full bg-slate-800 px-3 py-2 rounded-lg">
            Uitloggen
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1">
        <header className="bg-white border-b p-4 font-semibold capitalize">
          {tab}
        </header>

        <div className="p-6 space-y-6">

          {/* PRODUCTS */}
          {tab === "products" && (
            <Card title="Onderdelen">
              <div className="grid grid-cols-2 gap-2 mb-4">
                {Object.entries(productForm).map(([k, v]) => (
                  <input
                    key={k}
                    placeholder={k}
                    value={v}
                    onChange={e => setProductForm({ ...productForm, [k]: e.target.value })}
                    className="border rounded-lg px-3 py-2"
                  />
                ))}
              </div>
              <button onClick={addProduct} className="bg-emerald-600 text-white px-4 py-2 rounded-lg">
                Opslaan
              </button>

              <table className="w-full text-sm mt-6">
                <thead className="border-b">
                  <tr>
                    <th>Naam</th>
                    <th>Nr</th>
                    <th>Motor</th>
                    <th>Bak</th>
                    <th>Prijs</th>
                    {features.canUseMarketplaces && <th>Publish</th>}
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id} className="border-b">
                      <td>{p.name}</td>
                      <td>{p.part_number}</td>
                      <td>{p.engine_code}</td>
                      <td>{p.gearbox_code}</td>
                      <td>{p.price ? `€${p.price}` : "-"}</td>
                      {features.canUseMarketplaces && (
                        <td className="space-x-2">
                          <button onClick={() => enqueuePublish("marktplaats", p)}>MP</button>
                          <button onClick={() => enqueuePublish("ebay", p)}>eBay</button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

          {/* LABELS */}
          {tab === "labels" && features.canUseLabels && (
            <Card title="Labels">
              <LabelDesigner company={activeCompany} selectedProduct={selectedProduct} />
            </Card>
          )}

          {/* DECODER */}
          {tab === "decoder" && (
            <Card title="Decoder (RDW)">
              <div className="flex gap-2 mb-3">
                <input
                  className="border rounded-xl px-4 py-2 flex-1"
                  placeholder="Kenteken"
                  value={kenteken}
                  onChange={e => setKenteken(e.target.value)}
                />
                <button onClick={rdwLookup} className="bg-emerald-600 text-white px-4 rounded-xl">
                  {rdwLoading ? "Zoeken…" : "Zoek"}
                </button>
              </div>

              {rdwResult && (
                <pre className="bg-slate-50 border rounded-xl p-4 text-xs">
                  {JSON.stringify(rdwResult, null, 2)}
                </pre>
              )}
            </Card>
          )}

          {/* MARKETPLACES */}
          {tab === "marketplaces" && features.canUseMarketplaces && (
            <Card title="Marketplace jobs">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th>Marketplace</th>
                    <th>Status</th>
                    <th>Error</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map(j => (
                    <tr key={j.id} className="border-b">
                      <td>{j.marketplace}</td>
                      <td>{j.status}</td>
                      <td>{j.last_error || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

        </div>
      </main>
    </div>
  );
}

/* ---------------- UI HELPERS ---------------- */

function NavBtn({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-2 rounded-lg ${
        active ? "bg-emerald-600" : "hover:bg-slate-800"
      }`}
    >
      {label}
    </button>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white border rounded-xl p-5">
      <h2 className="font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}
