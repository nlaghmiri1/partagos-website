import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";
import { useRole } from "./useRole";
import { featuresForPackage } from "./permissions";
import LabelDesigner from "./LabelDesigner";

/* ---------------- helpers ---------------- */

function goTo(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function escapeIlike(s) {
  return s.replaceAll("%", "\\%").replaceAll("_", "\\_");
}

/* ---------------- component ---------------- */

export default function Dashboard() {
  const { role, loading: roleLoading } = useRole();

  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("products");

  const [companies, setCompanies] = useState([]);
  const [activeCompany, setActiveCompany] = useState(null);

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [searchQ, setSearchQ] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ email: "", role: "viewer" });

  // Decoder (RDW)
  const [kenteken, setKenteken] = useState("");
  const [rdwResult, setRdwResult] = useState(null);
  const [rdwLoading, setRdwLoading] = useState(false);

  // Marketplace jobs
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);

  const [productForm, setProductForm] = useState({
    name: "",
    part_number: "",
    engine_code: "",
    gearbox_code: "",
    location: "",
    price: "",
    stock: 1,
  });

  /* ---------------- auth guard ---------------- */

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) goTo("/login");
    });
  }, []);

  /* ---------------- load companies ---------------- */

  useEffect(() => {
    loadCompanies();
  }, []);

  async function loadCompanies() {
    const { data } = await supabase.from("companies").select("*");
    if (data?.length) {
      setCompanies(data);
      setActiveCompany(data[0]);
    }
    setLoading(false);
  }

  /* ---------------- derived: features ---------------- */

  const features = useMemo(
    () => featuresForPackage(activeCompany?.package),
    [activeCompany]
  );

  /* ---------------- load data per company ---------------- */

  useEffect(() => {
    if (!activeCompany) return;
    loadProducts();
    if (features.canUseMultiUsers && role === "admin") loadUsers();
    if (features.canUseMarketplaces) loadJobs();
  }, [activeCompany, features, role]);

  async function loadProducts() {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("company_id", activeCompany.id)
      .order("created_at", { ascending: false });
    setProducts(data || []);
  }

  async function loadUsers() {
    const { data } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("company_id", activeCompany.id);
    setUsers(data || []);
  }

  async function loadJobs() {
    setJobsLoading(true);
    const { data } = await supabase
      .from("publish_jobs")
      .select("*")
      .eq("company_id", activeCompany.id)
      .order("created_at", { ascending: false })
      .limit(50);
    setJobs(data || []);
    setJobsLoading(false);
  }

  /* ---------------- actions ---------------- */

  async function addProduct() {
    if (!productForm.name) return;

    await supabase.from("products").insert([
      {
        company_id: activeCompany.id,
        ...productForm,
        price: productForm.price ? Number(productForm.price) : null,
        stock: Number(productForm.stock) || 1,
      },
    ]);

    setProductForm({
      name: "",
      part_number: "",
      engine_code: "",
      gearbox_code: "",
      location: "",
      price: "",
      stock: 1,
    });

    loadProducts();
  }

  async function runSearch() {
    const q = escapeIlike(searchQ.trim());
    if (!q) return;

    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("company_id", activeCompany.id)
      .or(
        `name.ilike.%${q}%,part_number.ilike.%${q}%,engine_code.ilike.%${q}%,gearbox_code.ilike.%${q}%`
      );

    setSearchResults(data || []);
  }

  async function addUser() {
    if (!newUser.email) return;
    if (users.length >= features.maxUsers) {
      alert("Maximaal aantal gebruikers bereikt voor dit pakket.");
      return;
    }

    await supabase.from("user_profiles").insert([
      {
        company_id: activeCompany.id,
        email: newUser.email.trim().toLowerCase(),
        role: newUser.role,
      },
    ]);

    setNewUser({ email: "", role: "viewer" });
    loadUsers();
  }

  async function logout() {
    await supabase.auth.signOut();
    goTo("/login");
  }

  async function rdwLookup() {
    const k = kenteken.trim();
    if (!k) return;
    setRdwLoading(true);
    setRdwResult(null);
    try {
      const resp = await fetch(`/api/rdw/lookup?kenteken=${encodeURIComponent(k)}`);
      const json = await resp.json();
      setRdwResult(json);
    } catch (e) {
      setRdwResult({ ok: false, error: e?.message || String(e) });
    } finally {
      setRdwLoading(false);
    }
  }

  async function enqueuePublish(marketplace, product) {
    if (!features.canUseMarketplaces) {
      alert("Marketplace publishing is alleen beschikbaar vanaf Growth.");
      return;
    }
    const resp = await fetch("/api/publish/enqueue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_id: activeCompany.id,
        marketplace,
        product_id: product.id,
      }),
    });
    const json = await resp.json();
    if (!json.ok) alert(json.error || "Enqueue failed");
    await loadJobs();
  }

  /* ---------------- render guards ---------------- */

  if (loading || roleLoading) {
    return <div className="min-h-screen flex items-center justify-center">Laden…</div>;
  }

  if (!role) {
    return <div className="p-6">Geen toegang</div>;
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
          <NavBtn label="Zoeken" active={tab === "search"} onClick={() => setTab("search")} />

          {features.canUseLabels && (
            <NavBtn label="Labels" active={tab === "labels"} onClick={() => setTab("labels")} />
          )}

          <NavBtn label="Decoder" active={tab === "decoder"} onClick={() => setTab("decoder")} />

          {features.canUseMarketplaces && (
            <NavBtn label="Marketplaces" active={tab === "marketplaces"} onClick={() => setTab("marketplaces")} />
          )}

          {features.canUseMultiUsers && role === "admin" && (
            <NavBtn label="Gebruikers" active={tab === "users"} onClick={() => setTab("users")} />
          )}
        </nav>

        <div className="p-4 border-t border-slate-700 text-xs">
          <div>Pakket: <b>{activeCompany?.package}</b></div>
          <button onClick={logout} className="mt-3 w-full bg-slate-800 px-3 py-2 rounded-lg">
            Uitloggen
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1">
        <header className="bg-white border-b p-4 flex justify-between items-center">
          <h1 className="font-semibold capitalize">{tab}</h1>

          <select
            value={activeCompany.id}
            onChange={(e) => setActiveCompany(companies.find((c) => c.id === e.target.value))}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.package})
              </option>
            ))}
          </select>
        </header>

        <div className="p-6 space-y-6">
          {/* PRODUCTS */}
          {tab === "products" && (
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card title="Nieuw onderdeel">
                {Object.entries(productForm).map(([k, v]) => (
                  <input
                    key={k}
                    placeholder={k}
                    value={v}
                    type={k === "price" || k === "stock" ? "number" : "text"}
                    onChange={(e) => setProductForm({ ...productForm, [k]: e.target.value })}
                    className="w-full mb-2 border rounded-lg px-3 py-2"
                  />
                ))}
                <button onClick={addProduct} className="mt-2 bg-emerald-600 text-white w-full py-2 rounded-lg">
                  Opslaan
                </button>
              </Card>

              <Card title="Onderdelen" className="lg:col-span-2">
                <div className="text-xs text-slate-500 mb-3">
                  Tip: klik een onderdeel om het direct in de Label Designer te laden.
                </div>

                <table className="w-full text-sm">
                  <thead className="border-b text-left">
                    <tr>
                      <th>Naam</th>
                      <th>Nr</th>
                      <th>Motor</th>
                      <th>Bak</th>
                      <th>Prijs</th>
                      <th>Voorraad</th>
                      {features.canUseMarketplaces && <th>Publish</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr
                        key={p.id}
                        className={`border-b cursor-pointer ${selectedProduct?.id === p.id ? "bg-emerald-50" : ""}`}
                        onClick={() => setSelectedProduct(p)}
                      >
                        <td>{p.name}</td>
                        <td>{p.part_number}</td>
                        <td>{p.engine_code}</td>
                        <td>{p.gearbox_code}</td>
                        <td>{p.price ? `€${p.price}` : "-"}</td>
                        <td>{p.stock}</td>
                        {features.canUseMarketplaces && (
                          <td>
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                className="px-2 py-1 rounded-lg border"
                                onClick={(e) => { e.stopPropagation(); enqueuePublish("marktplaats", p); }}
                              >
                                Marktplaats
                              </button>
                              <button
                                type="button"
                                className="px-2 py-1 rounded-lg border"
                                onClick={(e) => { e.stopPropagation(); enqueuePublish("ebay", p); }}
                              >
                                eBay
                              </button>
                              <button
                                type="button"
                                className="px-2 py-1 rounded-lg border"
                                onClick={(e) => { e.stopPropagation(); enqueuePublish("rrr", p); }}
                              >
                                RRR.lt
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </section>
          )}

          {/* SEARCH */}
          {tab === "search" && (
            <Card title="Zoeken">
              <div className="flex gap-2 mb-4">
                <input
                  className="flex-1 border rounded-lg px-4 py-2"
                  placeholder="Zoek op nr, motor, bak…"
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                />
                <button onClick={runSearch} className="bg-emerald-600 text-white px-4 rounded-lg">
                  Zoek
                </button>
              </div>

              <Table
                headers={["Naam", "Nr", "Motor", "Bak", "Prijs"]}
                rows={searchResults.map((p) => [
                  p.name,
                  p.part_number,
                  p.engine_code,
                  p.gearbox_code,
                  p.price ? `€${p.price}` : "-",
                ])}
              />
            </Card>
          )}

          {/* LABELS */}
          {tab === "labels" && features.canUseLabels && (
            <Card title="Labels (PDF / QR / barcode)">
              <LabelDesigner company={activeCompany} selectedProduct={selectedProduct} />
            </Card>
          )}

          {/* DECODER */}
          {tab === "decoder" && (
            <Card title="Decoder (RDW kenteken)">
              <div className="text-sm text-slate-600 mb-3">
                Kenteken lookup via RDW Open Data. :contentReference[oaicite:9]{index=9}
              </div>

              <div className="flex gap-2">
                <input
                  className="flex-1 border rounded-xl px-4 py-2"
                  placeholder="Bijv: 12ABCD"
                  value={kenteken}
                  onChange={(e) => setKenteken(e.target.value)}
                />
                <button
                  onClick={rdwLookup}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 rounded-xl"
                >
                  {rdwLoading ? "Zoeken…" : "Zoek"}
                </button>
              </div>

              {rdwResult && (
                <div className="mt-4 rounded-xl border p-4 text-sm bg-slate-50">
                  <pre className="whitespace-pre-wrap break-words">{JSON.stringify(rdwResult, null, 2)}</pre>
                </div>
              )}

              <div className="mt-4 text-xs text-slate-500">
                TecAlliance/TecDoc VIN & fitment: licentie/contract nodig (we hebben de connector-slot klaarstaan). :contentReference[oaicite:10]{index=10}
              </div>
            </Card>
          )}

          {/* MARKETPLACES */}
          {tab === "marketplaces" && features.canUseMarketplaces && (
            <Card title="Marketplace publishing (jobs)">
              <div className="text-sm text-slate-600 mb-3">
                Marktplaats Pro en eBay vereisen OAuth + tokens; RRR.lt meestal partner/API key. :contentReference[oaicite:11]{index=11}
              </div>

              <div className="flex items-center gap-2 mb-3">
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl border"
                  onClick={async () => {
                    await fetch("/api/publish/worker");
                    await loadJobs();
                  }}
                >
                  Verwerk 1 job (manual worker)
                </button>

                <button
                  type="button"
                  className="px-4 py-2 rounded-xl border"
                  onClick={loadJobs}
                  disabled={jobsLoading}
                >
                  {jobsLoading ? "Laden…" : "Refresh jobs"}
                </button>
              </div>

              <Table
                headers={["Created", "Marketplace", "Status", "Error"]}
                rows={jobs.map((j) => [
                  j.created_at ? new Date(j.created_at).toLocaleString() : "-",
                  j.marketplace,
                  j.status,
                  j.last_error || "",
                ])}
              />
            </Card>
          )}

          {/* USERS */}
          {tab === "users" && features.canUseMultiUsers && role === "admin" && (
            <Card title={`Gebruikers (${users.length}/${features.maxUsers})`}>
              <div className="flex gap-2 mb-4">
                <input
                  className="border rounded-lg px-3 py-2"
                  placeholder="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
                <select
                  className="border rounded-lg px-3 py-2"
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                >
                  {["admin", "warehouse", "sales", "viewer"].map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
                <button onClick={addUser} className="bg-emerald-600 text-white px-3 rounded-lg">
                  Toevoegen
                </button>
              </div>

              <Table headers={["Email", "Rol"]} rows={users.map((u) => [u.email, u.role])} />
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

/* ---------------- UI helpers ---------------- */

function NavBtn({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-2 rounded-lg ${active ? "bg-emerald-600" : "hover:bg-slate-800"}`}
    >
      {label}
    </button>
  );
}

function Card({ title, children, className = "" }) {
  return (
    <div className={`bg-white p-5 rounded-xl border ${className}`}>
      <h2 className="font-semibold mb-3">{title}</h2>
      {children}
    </div>
  );
}

function Table({ headers, rows }) {
  return (
    <table className="w-full text-sm">
      <thead className="border-b text-left">
        <tr>
          {headers.map((h) => (
            <th key={h}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-b">
            {r.map((c, j) => (
              <td key={j}>{c}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
