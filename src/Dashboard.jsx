import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";
import { featuresForPackage } from "./permissions";
import LabelDesigner from "./LabelDesigner";

function goTo(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function safeArray(v) {
  return Array.isArray(v) ? v : [];
}

export default function Dashboard() {
  const [sessionLoading, setSessionLoading] = useState(true);
  const [userEmail, setUserEmail] = useState(null);
  const [role, setRole] = useState(null);

  const [companies, setCompanies] = useState([]);
  const [activeCompany, setActiveCompany] = useState(null);

  const [tab, setTab] = useState("products");

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [vehicles, setVehicles] = useState([]);
  const [activeVehicle, setActiveVehicle] = useState(null);

  const [fitments, setFitments] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [productForm, setProductForm] = useState({
    name: "",
    part_number: "",
    engine_code: "",
    gearbox_code: "",
    location: "",
    price: "",
    stock: 1
  });

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

  useEffect(() => {
    if (!userEmail) return;

    async function loadProfile() {
      const { data: profiles, error } = await supabase
        .from("user_profiles")
        .select("role, company_id, companies(*)")
        .eq("email", userEmail);

      if (error) {
        console.error(error);
        return;
      }

      const list = safeArray(profiles).filter((p) => p.companies);
      if (list.length === 0) return;

      setRole(list[0].role);
      const comps = list.map((p) => p.companies);
      setCompanies(comps);
      setActiveCompany(comps[0]);
    }

    loadProfile();
  }, [userEmail]);

  const features = useMemo(
    () => featuresForPackage(activeCompany?.package),
    [activeCompany]
  );

  useEffect(() => {
    if (!activeCompany) return;
    loadProducts();
    loadVehicles();
    if (features.canUseMarketplaces) loadJobs();
  }, [activeCompany, features.canUseMarketplaces]);

  useEffect(() => {
    if (!activeVehicle) {
      setFitments([]);
      return;
    }
    loadFitments(activeVehicle.id);
  }, [activeVehicle]);

  async function loadProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("company_id", activeCompany.id)
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    setProducts(safeArray(data));
  }

  async function loadVehicles() {
    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .eq("company_id", activeCompany.id)
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    const list = safeArray(data);
    setVehicles(list);
    if (!activeVehicle && list.length > 0) setActiveVehicle(list[0]);
  }

  async function loadFitments(vehicleId) {
    const { data, error } = await supabase
      .from("product_fitments")
      .select("*, products(*)")
      .eq("company_id", activeCompany.id)
      .eq("vehicle_id", vehicleId)
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    setFitments(safeArray(data));
  }

  async function loadJobs() {
    const { data, error } = await supabase
      .from("publish_jobs")
      .select("*")
      .eq("company_id", activeCompany.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) console.error(error);
    setJobs(safeArray(data));
  }

  async function addProduct() {
    if (!productForm.name || !activeCompany) return;

    const payload = {
      company_id: activeCompany.id,
      ...productForm,
      price: productForm.price ? Number(productForm.price) : null,
      stock: Number(productForm.stock) || 1
    };

    const { error } = await supabase.from("products").insert([payload]);
    if (error) console.error(error);

    setProductForm({
      name: "",
      part_number: "",
      engine_code: "",
      gearbox_code: "",
      location: "",
      price: "",
      stock: 1
    });

    await loadProducts();
  }

  async function linkProductToVehicle(productId, vehicleId, confidence = 80, notes = "") {
    const { error } = await supabase.from("product_fitments").insert([{
      company_id: activeCompany.id,
      product_id: productId,
      vehicle_id: vehicleId,
      confidence,
      notes
    }]);
    if (error) console.error(error);
    await loadFitments(vehicleId);
  }

  async function unlinkFitment(fitmentId) {
    const { error } = await supabase.from("product_fitments").delete().eq("id", fitmentId);
    if (error) console.error(error);
    if (activeVehicle?.id) await loadFitments(activeVehicle.id);
  }

  async function enqueuePublish(marketplace, product) {
    const resp = await fetch("/api/publish/enqueue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company_id: activeCompany.id, marketplace, product_id: product.id })
    });
    const json = await resp.json();
    if (!json.ok) alert(json.error || "Enqueue failed");
    await loadJobs();
  }

  async function runWorkerOnce() {
    await fetch("/api/publish/worker");
    await loadJobs();
  }

  async function logout() {
    await supabase.auth.signOut();
    goTo("/login");
  }

  const suggestedByVehicle = useMemo(() => {
    if (!activeVehicle) return [];
    const ec = (activeVehicle.engine_code || "").toLowerCase();
    const gb = (activeVehicle.gearbox_code || "").toLowerCase();
    if (!ec && !gb) return [];

    return products.filter((p) => {
      const pe = (p.engine_code || "").toLowerCase();
      const pg = (p.gearbox_code || "").toLowerCase();
      return (ec && pe && pe.includes(ec)) || (gb && pg && pg.includes(gb));
    }).slice(0, 20);
  }, [activeVehicle, products]);

  if (sessionLoading) return <div className="min-h-screen flex items-center justify-center">Laden…</div>;
  if (!activeCompany) return <div className="p-6">Geen bedrijf gevonden.</div>;

  // hard block: customers cannot access admin customers
  // (button is already hidden, but this prevents manual tab jumps)
  if (tab === "admin" && role !== "admin") {
    setTab("products");
  }

  return (
    <div className="min-h-screen flex bg-slate-100">
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-5 font-bold text-xl border-b border-slate-700">Partagos</div>

        <nav className="flex-1 p-3 space-y-1 text-sm">
          <NavBtn label="Onderdelen" active={tab === "products"} onClick={() => setTab("products")} />
          {features.canUseLabels && <NavBtn label="Labels" active={tab === "labels"} onClick={() => setTab("labels")} />}
          <NavBtn label="Decoder" active={tab === "decoder"} onClick={() => setTab("decoder")} />
          {features.canUseMarketplaces && <NavBtn label="Marketplaces" active={tab === "marketplaces"} onClick={() => setTab("marketplaces")} />}

          {/* ADMIN ONLY */}
          {role === "admin" && (
            <NavBtn
              label="Admin: nieuwe klant aanmaken"
              active={false}
              onClick={() => goTo("/admin/customers")}
              className="bg-indigo-600 hover:bg-indigo-500"
            />
          )}
        </nav>

        <div className="p-4 border-t border-slate-700 text-xs space-y-1">
          <div className="font-semibold">{activeCompany.name}</div>
          <div>Pakket: <b>{activeCompany.package}</b></div>
          <div>Rol: <b>{role || "-"}</b></div>
          <button onClick={logout} className="mt-3 w-full bg-slate-800 px-3 py-2 rounded-lg">
            Uitloggen
          </button>
        </div>
      </aside>

      <main className="flex-1">
        <header className="bg-white border-b p-4 flex items-center justify-between">
          <div className="font-semibold capitalize">{tab}</div>
          <select
            value={activeCompany.id}
            onChange={(e) => {
              const c = companies.find((x) => x.id === e.target.value);
              setActiveCompany(c);
              setActiveVehicle(null);
              setSelectedProduct(null);
            }}
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
          {tab === "products" && (
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card title="Nieuw onderdeel">
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(productForm).map(([k, v]) => (
                    <input
                      key={k}
                      placeholder={k}
                      value={v}
                      type={(k === "price" || k === "stock") ? "number" : "text"}
                      onChange={(e) => setProductForm({ ...productForm, [k]: e.target.value })}
                      className="border rounded-lg px-3 py-2"
                    />
                  ))}
                </div>
                <button onClick={addProduct} className="mt-3 bg-emerald-600 text-white px-4 py-2 rounded-lg w-full">
                  Opslaan
                </button>
                <div className="mt-4 text-xs text-slate-500">
                  Tip: klik een product om te gebruiken in Labels of om te publishen.
                </div>
              </Card>

              <Card title="Voorraad" className="lg:col-span-2">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b text-left">
                      <tr>
                        <th className="py-2 pr-4">Naam</th>
                        <th className="py-2 pr-4">Nr</th>
                        <th className="py-2 pr-4">Motor</th>
                        <th className="py-2 pr-4">Bak</th>
                        <th className="py-2 pr-4">Prijs</th>
                        <th className="py-2 pr-4">Voorraad</th>
                        {features.canUseMarketplaces && <th className="py-2 pr-4">Publish</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => (
                        <tr
                          key={p.id}
                          className={`border-b cursor-pointer ${selectedProduct?.id === p.id ? "bg-emerald-50" : ""}`}
                          onClick={() => setSelectedProduct(p)}
                        >
                          <td className="py-2 pr-4 font-medium">{p.name}</td>
                          <td className="py-2 pr-4">{p.part_number || "-"}</td>
                          <td className="py-2 pr-4">{p.engine_code || "-"}</td>
                          <td className="py-2 pr-4">{p.gearbox_code || "-"}</td>
                          <td className="py-2 pr-4">{p.price ? `€${p.price}` : "-"}</td>
                          <td className="py-2 pr-4">{p.stock ?? "-"}</td>

                          {features.canUseMarketplaces && (
                            <td className="py-2 pr-4" onClick={(e) => e.stopPropagation()}>
                              <div className="flex flex-wrap gap-2">
                                <button className="px-2 py-1 rounded-lg border" onClick={() => enqueuePublish("marktplaats", p)}>Marktplaats</button>
                                <button className="px-2 py-1 rounded-lg border" onClick={() => enqueuePublish("ebay", p)}>eBay</button>
                                <button className="px-2 py-1 rounded-lg border" onClick={() => enqueuePublish("rrr", p)}>RRR.lt</button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                      {products.length === 0 && (
                        <tr><td colSpan={features.canUseMarketplaces ? 7 : 6} className="py-6 text-center text-slate-500">Nog geen producten.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </section>
          )}

          {tab === "labels" && features.canUseLabels && (
            <Card title="Labels (PDF / QR / barcode)">
              <LabelDesigner company={activeCompany} selectedProduct={selectedProduct} />
            </Card>
          )}

          {tab === "decoder" && (
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card title="Voertuig opslaan (RDW kenteken)">
                <VehiclePanel
                  company={activeCompany}
                  vehicles={vehicles}
                  activeVehicle={activeVehicle}
                  onActiveVehicle={setActiveVehicle}
                  onReloadVehicles={loadVehicles}
                />
              </Card>

              <Card title="Fitment koppelen aan voorraad" className="lg:col-span-2">
                <FitmentLinker
                  activeVehicle={activeVehicle}
                  products={products}
                  fitments={fitments}
                  suggested={suggestedByVehicle}
                  onLink={(pid) => linkProductToVehicle(pid, activeVehicle.id, 80, "Manual/Auto")}
                  onUnlink={unlinkFitment}
                  onSelectProduct={setSelectedProduct}
                />
              </Card>
            </section>
          )}

          {tab === "marketplaces" && features.canUseMarketplaces && (
            <Card title="Marketplace publishing (jobs & export)">
              <MarketplacePanel
                company={activeCompany}
                jobs={jobs}
                onReload={loadJobs}
                onWorker={runWorkerOnce}
              />
            </Card>
          )}

          {tab === "labels" && !features.canUseLabels && (
            <Card title="Labels">
              <div className="text-sm text-slate-600">Labels zijn beschikbaar vanaf Growth.</div>
            </Card>
          )}

          {tab === "marketplaces" && !features.canUseMarketplaces && (
            <Card title="Marketplaces">
              <div className="text-sm text-slate-600">Marketplaces zijn beschikbaar vanaf Growth.</div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

function VehiclePanel({ company, vehicles, activeVehicle, onActiveVehicle, onReloadVehicles }) {
  const [kenteken, setKenteken] = useState("");
  const [rdwLoading, setRdwLoading] = useState(false);
  const [rdwResult, setRdwResult] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);

  async function rdwLookup() {
    if (!kenteken.trim()) return;
    setRdwLoading(true);
    setRdwResult(null);

    try {
      const r = await fetch(`/api/rdw/lookup?kenteken=${encodeURIComponent(kenteken.trim())}`);
      const json = await r.json();
      setRdwResult(json);
    } catch (e) {
      setRdwResult({ ok: false, error: e?.message || String(e) });
    } finally {
      setRdwLoading(false);
    }
  }

  async function saveVehicle() {
    if (!rdwResult?.ok || !rdwResult?.voertuig) return;
    setSaveLoading(true);

    try {
      const resp = await fetch("/api/rdw/saveVehicle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_id: company.id, voertuig: rdwResult.voertuig })
      });
      const json = await resp.json();
      if (!json.ok) throw new Error(json.error || "saveVehicle failed");

      await onReloadVehicles();
      onActiveVehicle(json.vehicle);
      setKenteken("");
      setRdwResult(null);
    } catch (e) {
      alert(e?.message || String(e));
    } finally {
      setSaveLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-xs text-slate-500">RDW lookup voor NL kentekens. Opslaan per bedrijf.</div>

      <div className="flex gap-2">
        <input
          className="border rounded-xl px-4 py-2 flex-1"
          placeholder="Kenteken (bijv. 12ABCD)"
          value={kenteken}
          onChange={(e) => setKenteken(e.target.value)}
        />
        <button onClick={rdwLookup} className="bg-emerald-600 text-white px-4 rounded-xl">
          {rdwLoading ? "Zoeken…" : "Zoek"}
        </button>
      </div>

      {rdwResult && (
        <div className="rounded-xl border bg-slate-50 p-3 text-xs">
          <pre className="whitespace-pre-wrap break-words">{JSON.stringify(rdwResult, null, 2)}</pre>
          <button
            className="mt-2 px-4 py-2 rounded-xl bg-slate-900 text-white"
            disabled={!rdwResult.ok || saveLoading}
            onClick={saveVehicle}
          >
            {saveLoading ? "Opslaan…" : "Sla voertuig op"}
          </button>
        </div>
      )}

      <div className="border rounded-xl bg-white p-3">
        <div className="text-sm font-semibold mb-2">Opgeslagen voertuigen</div>
        <div className="space-y-2">
          {vehicles.map((v) => (
            <button
              key={v.id}
              onClick={() => onActiveVehicle(v)}
              className={`w-full text-left border rounded-xl px-3 py-2 ${
                activeVehicle?.id === v.id ? "border-emerald-300 bg-emerald-50" : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              <div className="text-sm font-medium">{v.license_plate || "—"} • {v.make || "—"} {v.model || ""}</div>
              <div className="text-xs text-slate-500">
                {v.fuel_type || ""} {v.power_kw ? `• ${v.power_kw}kW` : ""} {v.first_registration_date ? `• ${v.first_registration_date}` : ""}
              </div>
            </button>
          ))}
          {vehicles.length === 0 && <div className="text-sm text-slate-500">Nog geen voertuigen opgeslagen.</div>}
        </div>
      </div>
    </div>
  );
}

function FitmentLinker({ activeVehicle, products, fitments, suggested, onLink, onUnlink, onSelectProduct }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return products.slice(0, 50);
    return products.filter((p) => {
      const blob = `${p.name || ""} ${p.part_number || ""} ${p.engine_code || ""} ${p.gearbox_code || ""}`.toLowerCase();
      return blob.includes(s);
    }).slice(0, 50);
  }, [q, products]);

  if (!activeVehicle) return <div className="text-sm text-slate-600">Selecteer eerst een voertuig links.</div>;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-slate-50 p-3">
        <div className="text-sm font-semibold">
          Actief voertuig: {activeVehicle.license_plate || "—"} • {activeVehicle.make || "—"} {activeVehicle.model || ""}
        </div>
        <div className="text-xs text-slate-600 mt-1">Koppel onderdelen aan dit voertuig (fitment).</div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="border rounded-xl p-3 bg-white">
          <div className="text-sm font-semibold mb-2">Koppelingen</div>
          <div className="space-y-2">
            {fitments.map((f) => (
              <div key={f.id} className="border rounded-xl px-3 py-2 flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium text-sm">{f.products?.name || "—"}</div>
                  <div className="text-xs text-slate-500">{f.products?.part_number || ""} • confidence {f.confidence}</div>
                </div>
                <button className="text-sm px-2 py-1 border rounded-lg" onClick={() => onUnlink(f.id)}>
                  Ontkoppel
                </button>
              </div>
            ))}
            {fitments.length === 0 && <div className="text-sm text-slate-500">Nog geen koppelingen.</div>}
          </div>
        </div>

        <div className="border rounded-xl p-3 bg-white">
          <div className="text-sm font-semibold mb-2">Suggesties (MVP)</div>
          <div className="text-xs text-slate-500 mb-2">Match op engine_code/gearbox_code (als je die invult bij voertuigen/producten).</div>
          <div className="space-y-2">
            {suggested.map((p) => (
              <div key={p.id} className="border rounded-xl px-3 py-2 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{p.name}</div>
                  <div className="text-xs text-slate-500 truncate">{p.part_number || ""} • {p.engine_code || "-"} • {p.gearbox_code || "-"}</div>
                </div>
                <div className="flex gap-2">
                  <button className="text-sm px-2 py-1 border rounded-lg" onClick={() => onSelectProduct(p)}>Select</button>
                  <button className="text-sm px-2 py-1 border rounded-lg" onClick={() => onLink(p.id)}>Koppel</button>
                </div>
              </div>
            ))}
            {suggested.length === 0 && <div className="text-sm text-slate-500">Geen suggesties.</div>}
          </div>
        </div>
      </div>

      <div className="border rounded-xl p-3 bg-white">
        <div className="text-sm font-semibold mb-2">Handmatig koppelen</div>
        <input
          className="w-full border rounded-xl px-4 py-2 mb-3"
          placeholder="Zoek product (naam, nr, motor, bak)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <div className="max-h-[340px] overflow-auto border rounded-xl">
          <table className="w-full text-sm">
            <thead className="border-b text-left">
              <tr>
                <th className="py-2 px-3">Product</th>
                <th className="py-2 px-3">Nr</th>
                <th className="py-2 px-3">Actie</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b">
                  <td className="py-2 px-3">{p.name}</td>
                  <td className="py-2 px-3">{p.part_number || "-"}</td>
                  <td className="py-2 px-3">
                    <button className="text-sm px-3 py-1 border rounded-lg" onClick={() => onLink(p.id)}>
                      Koppel
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={3} className="py-6 text-center text-slate-500">Geen resultaten.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MarketplacePanel({ company, jobs, onReload, onWorker }) {
  const feedUrl = `/api/publish/export.csv?company_id=${company.id}`;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-slate-50 p-3">
        <div className="text-sm font-semibold">Product feed export (CSV)</div>
        <div className="text-xs text-slate-600 mt-1">Downloadbare feed per bedrijf.</div>
        <div className="mt-2 flex items-center gap-2">
          <a className="px-4 py-2 rounded-xl border bg-white" href={feedUrl}>
            Download CSV
          </a>
          <code className="text-xs bg-white border rounded-xl px-3 py-2">{feedUrl}</code>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="px-4 py-2 rounded-xl border bg-white" onClick={onReload}>Refresh jobs</button>
        <button className="px-4 py-2 rounded-xl border bg-white" onClick={onWorker}>Verwerk 1 job (worker)</button>
      </div>

      <div className="border rounded-xl bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b text-left">
            <tr>
              <th className="py-2 px-3">Created</th>
              <th className="py-2 px-3">Marketplace</th>
              <th className="py-2 px-3">Status</th>
              <th className="py-2 px-3">Error</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j.id} className="border-b">
                <td className="py-2 px-3">{j.created_at ? new Date(j.created_at).toLocaleString() : "-"}</td>
                <td className="py-2 px-3">{j.marketplace}</td>
                <td className="py-2 px-3">{j.status}</td>
                <td className="py-2 px-3">{j.last_error || ""}</td>
              </tr>
            ))}
            {jobs.length === 0 && <tr><td colSpan={4} className="py-6 text-center text-slate-500">Nog geen publish jobs.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-slate-500">
        Nu is dit “framework klaar”. Zodra je marketplace keys hebt, vervangen we worker-stub door echte publish calls.
      </div>
    </div>
  );
}

function NavBtn({ label, active, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-2 rounded-lg ${active ? "bg-emerald-600" : "hover:bg-slate-800"} ${className}`}
    >
      {label}
    </button>
  );
}

function Card({ title, children, className = "" }) {
  return (
    <div className={`bg-white border rounded-xl p-5 ${className}`}>
      <h2 className="font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}
