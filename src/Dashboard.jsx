import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";

/**
 * Partagos Dashboard (Professional)
 * Tabs:
 * 1) Onderdelen (CRUD light: insert + list)
 * 2) Zoeken (VIN / chassis / motor / bak / onderdeelnummer / tekst)
 * 3) Labels (labelprofielen + label preview/print)
 * 4) Rollen (demo user_profiles per tenant)
 *
 * Let op: dit dashboard werkt zonder Supabase Auth (demo). Rollen zijn data-only.
 */

const TABS = [
  { key: "products", label: "Onderdelen" },
  { key: "search", label: "Zoeken" },
  { key: "labels", label: "Labels" },
  { key: "roles", label: "Rollen" },
];

const ROLE_OPTIONS = ["admin", "warehouse", "sales", "viewer"];
const LABEL_SIZES = [
  { value: "100x150", label: "100×150 mm (verzendetiket)" },
  { value: "102x76", label: "102×76 mm" },
  { value: "70x50", label: "70×50 mm" },
];

const FIELD_OPTIONS = [
  { key: "name", label: "Naam" },
  { key: "part_number", label: "Onderdeelnummer" },
  { key: "engine_code", label: "Motorcode" },
  { key: "gearbox_code", label: "Bakcode" },
  { key: "location", label: "Locatie" },
  { key: "price", label: "Prijs" },
  { key: "stock", label: "Voorraad" },
  { key: "vin", label: "VIN" },
  { key: "chassis", label: "Chassis" },
];

export default function Dashboard() {
  const [tab, setTab] = useState("products");
  const [loading, setLoading] = useState(true);

  // Tenancy
  const [companies, setCompanies] = useState([]);
  const [activeCompanyId, setActiveCompanyId] = useState("");

  // Products
  const [products, setProducts] = useState([]);
  const [productForm, setProductForm] = useState({
    name: "",
    part_number: "",
    engine_code: "",
    gearbox_code: "",
    location: "",
    price: "",
    stock: 1,
    vin: "",
    chassis: "",
  });

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Labels
  const [labelProfiles, setLabelProfiles] = useState([]);
  const [activeLabelProfileId, setActiveLabelProfileId] = useState("");
  const [labelForm, setLabelForm] = useState({
    name: "Standaard Label",
    size: "100x150",
    header_text: "",
    footer_text: "Partagos • Demo",
    fields: ["name", "part_number", "engine_code", "gearbox_code", "location", "price", "stock", "vin", "chassis"],
  });
  const [labelPreviewProductId, setLabelPreviewProductId] = useState("");

  // Roles
  const [users, setUsers] = useState([]);
  const [userForm, setUserForm] = useState({
    email: "",
    full_name: "",
    role: "viewer",
  });

  const activeCompany = useMemo(
    () => companies.find((c) => c.id === activeCompanyId) || null,
    [companies, activeCompanyId]
  );

  const activeLabelProfile = useMemo(
    () => labelProfiles.find((lp) => lp.id === activeLabelProfileId) || null,
    [labelProfiles, activeLabelProfileId]
  );

  const labelPreviewProduct = useMemo(
    () => products.find((p) => p.id === labelPreviewProductId) || null,
    [products, labelPreviewProductId]
  );

  /* ---------------- NAV ---------------- */
  function goTo(path) {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  /* ---------------- BOOT ---------------- */
  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadCompanies();
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!activeCompanyId) return;
    (async () => {
      await Promise.all([loadProducts(activeCompanyId), loadLabelProfiles(activeCompanyId), loadUsers(activeCompanyId)]);
    })();
    // reset per tenant
    setSearchResults([]);
    setSearchQuery("");
  }, [activeCompanyId]);

  /* ---------------- LOADERS ---------------- */

  async function loadCompanies() {
    const { data, error } = await supabase.from("companies").select("*").order("created_at", { ascending: true });
    if (error) {
      alert("Fout bij laden bedrijven: " + error.message);
      return;
    }
    setCompanies(data || []);
    if (data && data.length) setActiveCompanyId(data[0].id);
  }

  async function loadProducts(companyId) {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    if (error) {
      alert("Fout bij laden producten: " + error.message);
      return;
    }
    setProducts(data || []);
    // default label preview selection
    if ((data || []).length && !labelPreviewProductId) setLabelPreviewProductId((data || [])[0].id);
  }

  async function loadLabelProfiles(companyId) {
    const { data, error } = await supabase
      .from("label_profiles")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: true });

    if (error) {
      alert("Fout bij laden labels: " + error.message);
      return;
    }

    const list = data || [];
    setLabelProfiles(list);

    if (list.length) {
      setActiveLabelProfileId(list[0].id);
      // sync form with first profile
      const lp = list[0];
      setLabelForm({
        name: lp.name || "Standaard Label",
        size: lp.size || "100x150",
        header_text: lp.header_text || "",
        footer_text: lp.footer_text || "",
        fields: Array.isArray(lp.fields) ? lp.fields : (lp.fields || []),
      });
    } else {
      setActiveLabelProfileId("");
    }
  }

  async function loadUsers(companyId) {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    if (error) {
      alert("Fout bij laden gebruikers: " + error.message);
      return;
    }
    setUsers(data || []);
  }

  /* ---------------- PRODUCTS ---------------- */

  async function addProduct() {
    if (!productForm.name || !activeCompanyId) {
      alert("Naam en bedrijf zijn verplicht.");
      return;
    }

    const payload = {
      company_id: activeCompanyId,
      name: productForm.name,
      part_number: productForm.part_number || null,
      engine_code: productForm.engine_code || null,
      gearbox_code: productForm.gearbox_code || null,
      location: productForm.location || null,
      price: productForm.price ? Number(productForm.price) : null,
      stock: Number(productForm.stock) || 1,
      vin: productForm.vin || null,
      chassis: productForm.chassis || null,
    };

    const { error } = await supabase.from("products").insert([payload]);
    if (error) {
      alert("Fout bij opslaan onderdeel: " + error.message);
      return;
    }

    setProductForm({
      name: "",
      part_number: "",
      engine_code: "",
      gearbox_code: "",
      location: "",
      price: "",
      stock: 1,
      vin: "",
      chassis: "",
    });

    await loadProducts(activeCompanyId);
  }

  /* ---------------- SEARCH ---------------- */

  async function runSearch() {
    const q = (searchQuery || "").trim();
    if (!q || !activeCompanyId) return;

    setSearchLoading(true);

    // eenvoudige, maar effectieve simulatie:
    // zoekt in part_number, engine_code, gearbox_code, vin, chassis en name
    // (Supabase OR via .or())
    const orExpr = [
      `part_number.ilike.%${escapeIlike(q)}%`,
      `engine_code.ilike.%${escapeIlike(q)}%`,
      `gearbox_code.ilike.%${escapeIlike(q)}%`,
      `vin.ilike.%${escapeIlike(q)}%`,
      `chassis.ilike.%${escapeIlike(q)}%`,
      `name.ilike.%${escapeIlike(q)}%`,
    ].join(",");

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("company_id", activeCompanyId)
      .or(orExpr)
      .order("created_at", { ascending: false })
      .limit(50);

    setSearchLoading(false);

    if (error) {
      alert("Zoekfout: " + error.message);
      return;
    }
    setSearchResults(data || []);
  }

  /* ---------------- LABELS ---------------- */

  function syncLabelFormFromActive() {
    const lp = activeLabelProfile;
    if (!lp) return;
    setLabelForm({
      name: lp.name || "Standaard Label",
      size: lp.size || "100x150",
      header_text: lp.header_text || "",
      footer_text: lp.footer_text || "",
      fields: Array.isArray(lp.fields) ? lp.fields : (lp.fields || []),
    });
  }

  async function createLabelProfile() {
    if (!activeCompanyId) return;
    const name = prompt("Naam labelprofiel:", "Nieuw label");
    if (!name) return;

    const { error } = await supabase.from("label_profiles").insert([
      {
        company_id: activeCompanyId,
        name,
        size: "100x150",
        header_text: activeCompany?.name || "",
        footer_text: "Partagos • Demo",
        fields: ["name", "part_number", "engine_code", "gearbox_code", "location", "price", "stock", "vin", "chassis"],
      },
    ]);

    if (error) {
      alert("Fout bij aanmaken labelprofiel: " + error.message);
      return;
    }

    await loadLabelProfiles(activeCompanyId);
  }

  async function saveActiveLabelProfile() {
    if (!activeLabelProfileId) {
      alert("Geen actief labelprofiel geselecteerd.");
      return;
    }

    const { error } = await supabase
      .from("label_profiles")
      .update({
        name: labelForm.name,
        size: labelForm.size,
        header_text: labelForm.header_text,
        footer_text: labelForm.footer_text,
        fields: labelForm.fields,
      })
      .eq("id", activeLabelProfileId);

    if (error) {
      alert("Fout bij opslaan labelprofiel: " + error.message);
      return;
    }

    await loadLabelProfiles(activeCompanyId);
  }

  function toggleLabelField(fieldKey) {
    setLabelForm((prev) => {
      const exists = prev.fields.includes(fieldKey);
      const nextFields = exists ? prev.fields.filter((f) => f !== fieldKey) : [...prev.fields, fieldKey];
      return { ...prev, fields: nextFields };
    });
  }

  function openPrintLabel() {
    if (!labelPreviewProduct || !labelForm) {
      alert("Selecteer een product voor label preview.");
      return;
    }
    const html = buildLabelHTML({
      companyName: activeCompany?.name || "Partagos",
      profile: labelForm,
      product: labelPreviewProduct,
    });

    const w = window.open("", "_blank", "noopener,noreferrer,width=720,height=900");
    if (!w) {
      alert("Popup geblokkeerd. Sta popups toe om te printen.");
      return;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.focus();
    // automatisch printen (optioneel): w.print();
  }

  /* ---------------- ROLES ---------------- */

  async function addUser() {
    if (!activeCompanyId) return;
    if (!userForm.email) {
      alert("E-mail is verplicht.");
      return;
    }

    const { error } = await supabase.from("user_profiles").insert([
      {
        company_id: activeCompanyId,
        email: userForm.email.trim().toLowerCase(),
        full_name: userForm.full_name || null,
        role: userForm.role || "viewer",
      },
    ]);

    if (error) {
      alert("Fout bij aanmaken gebruiker: " + error.message);
      return;
    }

    setUserForm({ email: "", full_name: "", role: "viewer" });
    await loadUsers(activeCompanyId);
  }

  async function updateUserRole(userId, role) {
    const { error } = await supabase.from("user_profiles").update({ role }).eq("id", userId);
    if (error) {
      alert("Fout bij wijzigen rol: " + error.message);
      return;
    }
    await loadUsers(activeCompanyId);
  }

  /* ---------------- UI ---------------- */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Laden…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* SIDEBAR */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col">
        <div className="px-6 py-5 border-b border-slate-700">
          <div className="text-xl font-extrabold tracking-tight">Partagos</div>
          <div className="text-xs text-slate-300 mt-1">SaaS platform — auto-onderdelen</div>
        </div>

        <div className="px-6 py-4 border-b border-slate-700">
          <div className="text-xs text-slate-300 mb-2">Actief bedrijf</div>
          <select
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none"
            value={activeCompanyId}
            onChange={(e) => setActiveCompanyId(e.target.value)}
          >
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <div className="text-xs text-slate-400 mt-2">
            Tenant-ID: <span className="font-mono">{activeCompanyId.slice(0, 8)}…</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`w-full text-left px-4 py-2 rounded-lg text-sm ${
                tab === t.key ? "bg-emerald-600 text-white" : "hover:bg-slate-800 text-slate-200"
              }`}
              type="button"
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="px-6 py-4 border-t border-slate-700">
          <button
            type="button"
            onClick={() => goTo("/")}
            className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg px-4 py-2 text-sm"
          >
            Uitloggen
          </button>
          <div className="text-[11px] text-slate-400 mt-3">
            Demo zonder Auth. Rollen zijn data-only.
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1">
        {/* TOPBAR */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-slate-900">
              {tabLabel(tab)}
            </div>
            <div className="text-sm text-slate-500">
              {tabSubtitle(tab)}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:block text-sm text-slate-600">
              {activeCompany ? (
                <>
                  <span className="font-medium">{activeCompany.name}</span>
                </>
              ) : null}
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Supabase live
            </span>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* KPI ROW */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <KPI title="Onderdelen" value={String(products.length)} sub="Actieve items in tenant" />
            <KPI title="Zoekresultaten" value={String(searchResults.length)} sub="Laatste zoekopdracht" />
            <KPI title="Labelprofielen" value={String(labelProfiles.length)} sub="Per bedrijf instelbaar" />
          </div>

          {/* TAB CONTENT */}
          {tab === "products" && (
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                <div className="font-semibold text-slate-900">Nieuw onderdeel</div>
                <div className="text-sm text-slate-500 mt-1">
                  Voeg voorraad toe aan {activeCompany?.name || "bedrijf"}.
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3">
                  <Input label="Naam *" value={productForm.name} onChange={(v) => setProductForm({ ...productForm, name: v })} />
                  <Input label="Onderdeelnummer" value={productForm.part_number} onChange={(v) => setProductForm({ ...productForm, part_number: v })} />
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Motorcode" value={productForm.engine_code} onChange={(v) => setProductForm({ ...productForm, engine_code: v })} />
                    <Input label="Bakcode" value={productForm.gearbox_code} onChange={(v) => setProductForm({ ...productForm, gearbox_code: v })} />
                  </div>
                  <Input label="Locatie" value={productForm.location} onChange={(v) => setProductForm({ ...productForm, location: v })} />
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="VIN" value={productForm.vin} onChange={(v) => setProductForm({ ...productForm, vin: v })} />
                    <Input label="Chassis" value={productForm.chassis} onChange={(v) => setProductForm({ ...productForm, chassis: v })} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Prijs (€)" type="number" value={productForm.price} onChange={(v) => setProductForm({ ...productForm, price: v })} />
                    <Input label="Voorraad" type="number" value={String(productForm.stock)} onChange={(v) => setProductForm({ ...productForm, stock: Number(v) })} />
                  </div>

                  <button
                    type="button"
                    onClick={addProduct}
                    className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-2 font-medium"
                  >
                    Opslaan
                  </button>
                </div>
              </div>

              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900">Onderdelenlijst</div>
                    <div className="text-sm text-slate-500">Data komt live uit Supabase.</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => loadProducts(activeCompanyId)}
                    className="text-sm px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50"
                  >
                    Vernieuwen
                  </button>
                </div>

                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left text-slate-500 border-b">
                      <tr>
                        <th className="py-2 pr-4">Naam</th>
                        <th className="py-2 pr-4">Nr</th>
                        <th className="py-2 pr-4">Motor</th>
                        <th className="py-2 pr-4">Bak</th>
                        <th className="py-2 pr-4">Locatie</th>
                        <th className="py-2 pr-4">VIN</th>
                        <th className="py-2 pr-4">Prijs</th>
                        <th className="py-2 pr-4">Voorraad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => (
                        <tr key={p.id} className="border-b last:border-0">
                          <td className="py-2 pr-4 font-medium text-slate-900">{p.name}</td>
                          <td className="py-2 pr-4">{p.part_number || "-"}</td>
                          <td className="py-2 pr-4">{p.engine_code || "-"}</td>
                          <td className="py-2 pr-4">{p.gearbox_code || "-"}</td>
                          <td className="py-2 pr-4">{p.location || "-"}</td>
                          <td className="py-2 pr-4">{p.vin || "-"}</td>
                          <td className="py-2 pr-4">{p.price != null ? `€${p.price}` : "-"}</td>
                          <td className="py-2 pr-4">{p.stock ?? "-"}</td>
                        </tr>
                      ))}
                      {products.length === 0 && (
                        <tr>
                          <td colSpan={8} className="py-6 text-center text-slate-500">
                            Geen onderdelen gevonden in dit bedrijf.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {tab === "search" && (
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                  <div className="font-semibold text-slate-900">Zoeken (VIN / motor / bak / nr)</div>
                  <div className="text-sm text-slate-500">
                    Simulatie op basis van jouw productdata in Supabase (tenant-gebonden).
                  </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                  <input
                    className="w-full md:w-[420px] border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-200"
                    placeholder="VIN, chassis, motorcode, bakcode, onderdeelnummer, tekst…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") runSearch();
                    }}
                  />
                  <button
                    type="button"
                    onClick={runSearch}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-2 font-medium"
                    disabled={searchLoading}
                  >
                    {searchLoading ? "Zoeken…" : "Zoek"}
                  </button>
                </div>
              </div>

              <div className="mt-5 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-slate-500 border-b">
                    <tr>
                      <th className="py-2 pr-4">Naam</th>
                      <th className="py-2 pr-4">Nr</th>
                      <th className="py-2 pr-4">Motor</th>
                      <th className="py-2 pr-4">Bak</th>
                      <th className="py-2 pr-4">VIN</th>
                      <th className="py-2 pr-4">Locatie</th>
                      <th className="py-2 pr-4">Prijs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.map((p) => (
                      <tr key={p.id} className="border-b last:border-0">
                        <td className="py-2 pr-4 font-medium text-slate-900">{p.name}</td>
                        <td className="py-2 pr-4">{p.part_number || "-"}</td>
                        <td className="py-2 pr-4">{p.engine_code || "-"}</td>
                        <td className="py-2 pr-4">{p.gearbox_code || "-"}</td>
                        <td className="py-2 pr-4">{p.vin || "-"}</td>
                        <td className="py-2 pr-4">{p.location || "-"}</td>
                        <td className="py-2 pr-4">{p.price != null ? `€${p.price}` : "-"}</td>
                      </tr>
                    ))}
                    {searchResults.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-slate-500">
                          Nog geen resultaten. Voer een zoekterm in (bijv. “RJW”, “DQ400”, “0DD”, VIN, motorcode).
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {tab === "labels" && (
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profiles */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900">Labelprofielen</div>
                    <div className="text-sm text-slate-500">Per bedrijf eigen layout & velden.</div>
                  </div>
                  <button
                    type="button"
                    onClick={createLabelProfile}
                    className="text-sm px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50"
                  >
                    + Nieuw
                  </button>
                </div>

                <div className="mt-4 space-y-2">
                  {labelProfiles.map((lp) => (
                    <button
                      type="button"
                      key={lp.id}
                      onClick={() => {
                        setActiveLabelProfileId(lp.id);
                        // sync form to selected
                        const sel = lp;
                        setLabelForm({
                          name: sel.name || "Standaard Label",
                          size: sel.size || "100x150",
                          header_text: sel.header_text || "",
                          footer_text: sel.footer_text || "",
                          fields: Array.isArray(sel.fields) ? sel.fields : (sel.fields || []),
                        });
                      }}
                      className={`w-full text-left px-4 py-3 rounded-xl border ${
                        lp.id === activeLabelProfileId
                          ? "border-emerald-300 bg-emerald-50"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="font-medium text-slate-900">{lp.name}</div>
                      <div className="text-xs text-slate-500">Size: {lp.size}</div>
                    </button>
                  ))}

                  {labelProfiles.length === 0 && (
                    <div className="text-sm text-slate-500 mt-3">
                      Nog geen labelprofielen. Klik op “Nieuw”.
                    </div>
                  )}
                </div>
              </div>

              {/* Editor */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold text-slate-900">Label editor</div>
                    <div className="text-sm text-slate-500">
                      Kies welke informatie op de sticker komt (USP).
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={syncLabelFormFromActive}
                      className="text-sm px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50"
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      onClick={saveActiveLabelProfile}
                      className="text-sm px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                    >
                      Opslaan
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Profielnaam" value={labelForm.name} onChange={(v) => setLabelForm({ ...labelForm, name: v })} />
                  <Select
                    label="Stickerformaat"
                    value={labelForm.size}
                    onChange={(v) => setLabelForm({ ...labelForm, size: v })}
                    options={LABEL_SIZES}
                  />
                  <Input label="Header" value={labelForm.header_text} onChange={(v) => setLabelForm({ ...labelForm, header_text: v })} />
                  <Input label="Footer" value={labelForm.footer_text} onChange={(v) => setLabelForm({ ...labelForm, footer_text: v })} />
                </div>

                <div className="mt-5">
                  <div className="text-sm font-medium text-slate-900">Velden op label</div>
                  <div className="text-xs text-slate-500">Aan/uit per bedrijf.</div>

                  <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2">
                    {FIELD_OPTIONS.map((f) => {
                      const checked = labelForm.fields.includes(f.key);
                      return (
                        <label
                          key={f.key}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer ${
                            checked ? "border-emerald-300 bg-emerald-50" : "border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleLabelField(f.key)}
                          />
                          <span className="text-sm">{f.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <Select
                    label="Preview product"
                    value={labelPreviewProductId}
                    onChange={(v) => setLabelPreviewProductId(v)}
                    options={[
                      ...(products || []).map((p) => ({
                        value: p.id,
                        label: `${p.name}${p.part_number ? ` • ${p.part_number}` : ""}`,
                      })),
                    ]}
                  />

                  <div className="md:col-span-2">
                    <div className="text-sm font-medium text-slate-900">Preview</div>
                    <div className="text-xs text-slate-500">Open print view en druk af als PDF.</div>
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={openPrintLabel}
                        className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-4 py-2 font-medium"
                      >
                        Open print view (PDF)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!labelPreviewProduct) return;
                          alert("Tip: voeg later QR-code + barcode toe. (Volgende iteratie)");
                        }}
                        className="border border-slate-200 hover:bg-slate-50 rounded-xl px-4 py-2 text-sm"
                      >
                        QR/Barcode (next)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Inline label preview card */}
                <div className="mt-6 border border-slate-200 rounded-2xl p-4 bg-slate-50">
                  <div className="text-sm font-medium text-slate-900 mb-2">Inline preview</div>
                  {!labelPreviewProduct ? (
                    <div className="text-sm text-slate-500">Geen product geselecteerd.</div>
                  ) : (
                    <LabelCard
                      companyName={activeCompany?.name || "Partagos"}
                      profile={labelForm}
                      product={labelPreviewProduct}
                    />
                  )}
                </div>
              </div>
            </section>
          )}

          {tab === "roles" && (
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                <div className="font-semibold text-slate-900">Nieuwe gebruiker</div>
                <div className="text-sm text-slate-500 mt-1">
                  Demo user_profiles (zonder auth). Later koppelen we dit aan Supabase Auth.
                </div>

                <div className="mt-4 space-y-3">
                  <Input label="E-mail *" value={userForm.email} onChange={(v) => setUserForm({ ...userForm, email: v })} />
                  <Input label="Naam" value={userForm.full_name} onChange={(v) => setUserForm({ ...userForm, full_name: v })} />
                  <Select
                    label="Rol"
                    value={userForm.role}
                    onChange={(v) => setUserForm({ ...userForm, role: v })}
                    options={ROLE_OPTIONS.map((r) => ({ value: r, label: r }))}
                  />

                  <button
                    type="button"
                    onClick={addUser}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-2 font-medium w-full"
                  >
                    Gebruiker toevoegen
                  </button>
                </div>
              </div>

              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900">Gebruikers</div>
                    <div className="text-sm text-slate-500">Wijzig rollen per bedrijf.</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => loadUsers(activeCompanyId)}
                    className="text-sm px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50"
                  >
                    Vernieuwen
                  </button>
                </div>

                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left text-slate-500 border-b">
                      <tr>
                        <th className="py-2 pr-4">E-mail</th>
                        <th className="py-2 pr-4">Naam</th>
                        <th className="py-2 pr-4">Rol</th>
                        <th className="py-2 pr-4">Actie</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} className="border-b last:border-0">
                          <td className="py-2 pr-4 font-medium text-slate-900">{u.email}</td>
                          <td className="py-2 pr-4">{u.full_name || "-"}</td>
                          <td className="py-2 pr-4">
                            <select
                              className="border border-slate-200 rounded-lg px-3 py-1.5"
                              value={u.role}
                              onChange={(e) => updateUserRole(u.id, e.target.value)}
                            >
                              {ROLE_OPTIONS.map((r) => (
                                <option key={r} value={r}>
                                  {r}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-2 pr-4">
                            <span className="text-xs px-2 py-1 rounded-full border border-slate-200 bg-slate-50 text-slate-700">
                              tenant
                            </span>
                          </td>
                        </tr>
                      ))}
                      {users.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-6 text-center text-slate-500">
                            Nog geen gebruikers voor dit bedrijf.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 text-xs text-slate-500">
                  Volgende iteratie: Supabase Auth (e-mail login) + RLS per company_id.
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

function KPI({ title, value, sub }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="text-2xl font-extrabold text-slate-900 mt-1">{value}</div>
      <div className="text-xs text-slate-500 mt-2">{sub}</div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }) {
  return (
    <label className="block">
      <div className="text-xs text-slate-600 mb-1">{label}</div>
      <input
        className="w-full border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-200"
        value={value}
        type={type}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="block">
      <div className="text-xs text-slate-600 mb-1">{label}</div>
      <select
        className="w-full border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-200"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {(options || []).map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function LabelCard({ companyName, profile, product }) {
  const fields = Array.isArray(profile.fields) ? profile.fields : [];
  const size = profile.size || "100x150";

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="text-xs text-slate-500">Sticker {size}</div>
      <div className="font-semibold text-slate-900">{profile.header_text || companyName}</div>

      <div className="mt-3 space-y-1 text-sm">
        {fields.map((f) => (
          <div key={f} className="flex justify-between gap-4">
            <span className="text-slate-500">{fieldLabel(f)}</span>
            <span className="font-medium text-slate-900 text-right">{formatField(product, f)}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 text-xs text-slate-500">{profile.footer_text || ""}</div>
    </div>
  );
}

/* ---------------- HELPERS ---------------- */

function tabLabel(tab) {
  return (
    {
      products: "Onderdelenbeheer",
      search: "Zoeken",
      labels: "Labelbeheer",
      roles: "Rollen & Gebruikers",
    }[tab] || "Dashboard"
  );
}

function tabSubtitle(tab) {
  return (
    {
      products: "Voeg onderdelen toe en beheer voorraad per bedrijf.",
      search: "Zoek op VIN, chassis, motorcode, bakcode en onderdeelnummer.",
      labels: "Sticker layout per tenant, printbaar als PDF.",
      roles: "Demo rollen per bedrijf. Auth komt later.",
    }[tab] || ""
  );
}

function fieldLabel(key) {
  return FIELD_OPTIONS.find((f) => f.key === key)?.label || key;
}

function formatField(p, key) {
  const v = p?.[key];
  if (v == null || v === "") return "-";
  if (key === "price") return `€${v}`;
  return String(v);
}

function escapeIlike(input) {
  // Supabase ilike: escapet % en _
  return input.replaceAll("%", "\\%").replaceAll("_", "\\_");
}

function buildLabelHTML({ companyName, profile, product }) {
  const size = profile.size || "100x150";
  const fields = Array.isArray(profile.fields) ? profile.fields : [];

  // size mm → px for print (approx @ 96dpi: 1in=25.4mm, 96px/in)
  // we use CSS mm for print accuracy instead of px
  const [wMm, hMm] = size.split("x").map((n) => Number(n) || 100);

  const rows = fields
    .map((f) => {
      const label = fieldLabel(f);
      const val = formatField(product, f);
      return `<div class="row"><div class="k">${escapeHtml(label)}</div><div class="v">${escapeHtml(val)}</div></div>`;
    })
    .join("");

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Label print</title>
  <style>
    @page { size: ${wMm}mm ${hMm}mm; margin: 6mm; }
    body { font-family: Arial, sans-serif; }
    .sheet {
      width: ${wMm}mm;
      min-height: ${hMm}mm;
      border: 1px solid #e5e7eb;
      padding: 6mm;
      box-sizing: border-box;
    }
    .top { font-weight: 700; font-size: 13pt; margin-bottom: 4mm; }
    .sub { color: #6b7280; font-size: 9pt; margin-bottom: 4mm; }
    .row { display:flex; justify-content: space-between; gap: 10mm; font-size: 10pt; margin: 1.5mm 0; }
    .k { color: #6b7280; }
    .v { font-weight: 600; text-align: right; }
    .footer { margin-top: 6mm; font-size: 8.5pt; color: #6b7280; }
    .actions { margin: 10px 0; display:flex; gap: 10px; }
    button { padding: 8px 12px; border-radius: 10px; border: 1px solid #e5e7eb; background: #111827; color: white; cursor: pointer; }
    button.secondary { background: white; color: #111827; }
    @media print {
      .actions { display:none; }
      .sheet { border:none; }
    }
  </style>
</head>
<body>
  <div class="actions">
    <button onclick="window.print()">Print / Save as PDF</button>
    <button class="secondary" onclick="window.close()">Sluiten</button>
  </div>
  <div class="sheet">
    <div class="top">${escapeHtml(profile.header_text || companyName || "Partagos")}</div>
    <div class="sub">${escapeHtml(profile.name || "Label")}</div>
    ${rows}
    <div class="footer">${escapeHtml(profile.footer_text || "")}</div>
  </div>
</body>
</html>`;
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
