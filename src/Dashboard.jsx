import React, { useEffect, useMemo, useState } from "react";

/**
 * Partagos Demo Dashboard
 * - Multi-tenant (bedrijven) via localStorage
 * - VIN/motorcode/bakcode/onderdeelnummer zoeken (simulatie)
 * - Label preview (sticker layout) + Print/Save as PDF (browser print)
 *
 * NOTE: Geen externe dependencies. Vercel-safe. SPA-safe.
 */

const LS_KEY = "partagos_demo_state_v1";

const DEFAULT_STATE = {
  activeCompanyId: "c1",
  viewMode: "company", // "company" | "pool"
  companies: [
    { id: "c1", name: "Partagos Demo BV", country: "NL" },
    { id: "c2", name: "Ridderkerk Auto Parts", country: "NL" },
    { id: "c3", name: "Dubai Export Parts", country: "AE" },
  ],
  products: [
    // c1
    {
      id: "p1",
      companyId: "c1",
      name: "Versnellingsbak DQ400",
      partNumber: "0DD300045K",
      engineCode: "CHHA",
      gearboxCode: "RJW",
      location: "Magazijn A / Rek 3 / Vak B",
      price: 349,
      stock: 1,
      channels: { partagos: true, marktplaats: true, ebay: false, rrr: true },
    },
    {
      id: "p2",
      companyId: "c1",
      name: "Mechatronic unit DQ400",
      partNumber: "0DD325443A",
      engineCode: "CHHA",
      gearboxCode: "RJW",
      location: "Magazijn A / Rek 2 / Vak A",
      price: 275,
      stock: 2,
      channels: { partagos: true, marktplaats: false, ebay: false, rrr: false },
    },

    // c2
    {
      id: "p3",
      companyId: "c2",
      name: "Turbo 1.4 TSI",
      partNumber: "03C145702",
      engineCode: "CAVD",
      gearboxCode: "DQ200",
      location: "Magazijn B / Rek 1 / Vak C",
      price: 199,
      stock: 1,
      channels: { partagos: true, marktplaats: true, ebay: true, rrr: false },
    },

    // c3
    {
      id: "p4",
      companyId: "c3",
      name: "Achterlicht rechts Golf 7",
      partNumber: "5G0945096",
      engineCode: "—",
      gearboxCode: "—",
      location: "Warehouse DXB / Shelf 4 / Bin 12",
      price: 85,
      stock: 3,
      channels: { partagos: true, marktplaats: false, ebay: true, rrr: true },
    },
  ],
  labelProfiles: [
    // per company meerdere profielen
    {
      id: "lp1",
      companyId: "c1",
      name: "NL – Standaard (58x40)",
      size: "58x40",
      headerText: "Partagos Demo BV",
      footerText: "Retour: binnen 14 dagen • testomgeving",
      fields: {
        name: true,
        partNumber: true,
        engineCode: true,
        gearboxCode: true,
        location: true,
        price: true,
        stock: true,
        companyName: true,
        qr: true,
      },
    },
    {
      id: "lp2",
      companyId: "c3",
      name: "Export (100x50) – zonder prijs",
      size: "100x50",
      headerText: "Dubai Export Parts",
      footerText: "HS: 870840 • Export",
      fields: {
        name: true,
        partNumber: true,
        engineCode: true,
        gearboxCode: true,
        location: true,
        price: false,
        stock: true,
        companyName: true,
        qr: true,
      },
    },
  ],
};

// VIN / voertuig data simulatie
// (Hier simuleren we een VIN “decoder”: we matchen op prefix/fragment)
const VIN_DB = [
  {
    vinPrefix: "WVWZZZAU",
    make: "Volkswagen",
    model: "Golf GTE",
    year: "2015",
    engineCode: "CHHA",
    gearboxCode: "RJW",
    notes: "DQ400e Hybrid",
  },
  {
    vinPrefix: "WAUZZZ8V",
    make: "Audi",
    model: "A3 e-tron",
    year: "2016",
    engineCode: "CHHA",
    gearboxCode: "RJW",
    notes: "DQ400e Hybrid",
  },
  {
    vinPrefix: "WDB204",
    make: "Mercedes-Benz",
    model: "C-Klasse",
    year: "2012",
    engineCode: "OM651",
    gearboxCode: "722.9",
    notes: "voorbeeld",
  },
];

// Helpers
function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    // eenvoudige merge zodat nieuwe keys niet breken
    return { ...DEFAULT_STATE, ...parsed };
  } catch {
    return DEFAULT_STATE;
  }
}

function saveState(state) {
  localStorage.setItem(LS_KEY, JSON.stringify(state));
}

function uid(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export default function Dashboard() {
  const [state, setState] = useState(DEFAULT_STATE);

  // UI state
  const [companyDraft, setCompanyDraft] = useState({ name: "", country: "NL" });
  const [productDraft, setProductDraft] = useState({
    name: "",
    partNumber: "",
    engineCode: "",
    gearboxCode: "",
    location: "",
    price: "",
    stock: 1,
  });

  const [search, setSearch] = useState({
    vin: "",
    engineCode: "",
    gearboxCode: "",
    partNumber: "",
    q: "",
  });

  const [selectedProductId, setSelectedProductId] = useState(null);
  const [activeLabelProfileId, setActiveLabelProfileId] = useState(null);
  const [labelEditorOpen, setLabelEditorOpen] = useState(false);

  // SPA-safe navigation
  const goTo = (path) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  // init load
  useEffect(() => {
    const loaded = loadState();
    setState(loaded);
    // set default label profile for active company
    const firstProfile = loaded.labelProfiles.find((p) => p.companyId === loaded.activeCompanyId);
    setActiveLabelProfileId(firstProfile?.id || null);
  }, []);

  // persist
  useEffect(() => {
    saveState(state);
  }, [state]);

  const activeCompany = useMemo(
    () => state.companies.find((c) => c.id === state.activeCompanyId) || state.companies[0],
    [state]
  );

  const companies = state.companies;

  const labelProfilesForCompany = useMemo(
    () => state.labelProfiles.filter((p) => p.companyId === state.activeCompanyId),
    [state]
  );

  // Choose or fallback label profile
  const activeLabelProfile = useMemo(() => {
    const direct = state.labelProfiles.find((p) => p.id === activeLabelProfileId);
    if (direct) return direct;
    const first = state.labelProfiles.find((p) => p.companyId === state.activeCompanyId);
    return first || null;
  }, [state, activeLabelProfileId]);

  // VIN decode simulation
  const decodedVin = useMemo(() => {
    const vin = (search.vin || "").trim().toUpperCase();
    if (!vin) return null;

    // match by prefix (first 8) or first 6
    const candidates = VIN_DB
      .map((row) => {
        const score =
          vin.startsWith(row.vinPrefix) ? 3 : vin.startsWith(row.vinPrefix.slice(0, 6)) ? 2 : vin.includes(row.vinPrefix.slice(0, 5)) ? 1 : 0;
        return { row, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score);

    return candidates[0]?.row || null;
  }, [search.vin]);

  // Effective search terms: if VIN decoded, we apply engine/gearbox from vin if user didn't supply
  const effectiveFilters = useMemo(() => {
    const engine = (search.engineCode || "").trim().toUpperCase() || (decodedVin?.engineCode || "");
    const gearbox = (search.gearboxCode || "").trim().toUpperCase() || (decodedVin?.gearboxCode || "");
    const partNumber = (search.partNumber || "").trim().toUpperCase();
    const q = (search.q || "").trim().toLowerCase();

    return { engine, gearbox, partNumber, q };
  }, [search, decodedVin]);

  // Products shown: company view vs pool view
  const scopedProducts = useMemo(() => {
    if (state.viewMode === "pool") return state.products;
    return state.products.filter((p) => p.companyId === state.activeCompanyId);
  }, [state]);

  const filteredProducts = useMemo(() => {
    const { engine, gearbox, partNumber, q } = effectiveFilters;

    return scopedProducts.filter((p) => {
      const matchesEngine = engine ? (p.engineCode || "").toUpperCase().includes(engine) : true;
      const matchesGearbox = gearbox ? (p.gearboxCode || "").toUpperCase().includes(gearbox) : true;
      const matchesPart = partNumber ? (p.partNumber || "").toUpperCase().includes(partNumber) : true;

      const matchesQ = q
        ? `${p.name} ${p.partNumber} ${p.engineCode} ${p.gearboxCode} ${p.location}`.toLowerCase().includes(q)
        : true;

      return matchesEngine && matchesGearbox && matchesPart && matchesQ;
    });
  }, [scopedProducts, effectiveFilters]);

  const selectedProduct = useMemo(
    () => state.products.find((p) => p.id === selectedProductId) || null,
    [state, selectedProductId]
  );

  // KPI
  const kpi = useMemo(() => {
    const productsMyCompany = state.products.filter((p) => p.companyId === state.activeCompanyId);
    const activeAds = state.products.filter((p) => Object.values(p.channels || {}).some((v) => v)).length;
    const warehouses = 2; // demo; later from DB
    return {
      productsCompany: productsMyCompany.length,
      productsPool: state.products.length,
      activeAds,
      warehouses,
    };
  }, [state]);

  // Actions
  const setActiveCompany = (companyId) => {
    setState((s) => ({ ...s, activeCompanyId: companyId }));
    // update label profile selection to first for company
    const first = state.labelProfiles.find((p) => p.companyId === companyId);
    setActiveLabelProfileId(first?.id || null);
  };

  const addCompany = () => {
    const name = companyDraft.name.trim();
    if (!name) return;
    const newC = { id: uid("c"), name, country: companyDraft.country };
    setState((s) => ({ ...s, companies: [...s.companies, newC] }));
    setCompanyDraft({ name: "", country: "NL" });
  };

  const addProduct = () => {
    const name = productDraft.name.trim();
    const partNumber = productDraft.partNumber.trim();
    if (!name || !partNumber) return;

    const newP = {
      id: uid("p"),
      companyId: state.activeCompanyId,
      name,
      partNumber: partNumber.toUpperCase(),
      engineCode: (productDraft.engineCode || "").trim().toUpperCase() || "—",
      gearboxCode: (productDraft.gearboxCode || "").trim().toUpperCase() || "—",
      location: productDraft.location.trim() || "Magazijn A / Rek 1 / Vak A",
      price: Number(productDraft.price || 0),
      stock: Number(productDraft.stock || 1),
      channels: { partagos: true, marktplaats: false, ebay: false, rrr: false },
    };

    setState((s) => ({ ...s, products: [...s.products, newP] }));
    setProductDraft({
      name: "",
      partNumber: "",
      engineCode: "",
      gearboxCode: "",
      location: "",
      price: "",
      stock: 1,
    });
  };

  const toggleChannel = (productId, channelKey) => {
    setState((s) => ({
      ...s,
      products: s.products.map((p) => {
        if (p.id !== productId) return p;
        const channels = { ...(p.channels || {}) };
        channels[channelKey] = !channels[channelKey];
        return { ...p, channels };
      }),
    }));
  };

  const openLabel = (productId) => {
    setSelectedProductId(productId);
    setLabelEditorOpen(true);
  };

  const upsertLabelProfile = (profile) => {
    setState((s) => {
      const exists = s.labelProfiles.some((p) => p.id === profile.id);
      const next = exists
        ? s.labelProfiles.map((p) => (p.id === profile.id ? profile : p))
        : [...s.labelProfiles, profile];
      return { ...s, labelProfiles: next };
    });
    setActiveLabelProfileId(profile.id);
  };

  const createNewLabelProfile = () => {
    const newProfile = {
      id: uid("lp"),
      companyId: state.activeCompanyId,
      name: "Nieuw labelprofiel",
      size: "58x40",
      headerText: activeCompany?.name || "Partagos",
      footerText: "Demo • labelprofiel",
      fields: {
        name: true,
        partNumber: true,
        engineCode: true,
        gearboxCode: true,
        location: true,
        price: true,
        stock: true,
        companyName: true,
        qr: true,
      },
    };
    upsertLabelProfile(newProfile);
  };

  const printLabelAsPDF = ({ product, profile, company }) => {
    // Open a print window with a sticker layout. User can "Save as PDF".
    const w = window.open("", "_blank", "width=900,height=700");
    if (!w) return;

    const pxSize = profile.size === "100x50" ? { w: 600, h: 300 } : { w: 420, h: 290 }; // visual-only for preview
    const qrValue = `PARTAGOS|${company.id}|${product.id}|${product.partNumber}`;

    const fieldRow = (label, value) =>
      `<div style="display:flex;gap:10px;align-items:baseline;"><div style="min-width:110px;opacity:.7">${label}</div><div style="font-weight:700">${value}</div></div>`;

    const fieldsHtml = [
      profile.fields.companyName ? fieldRow("Bedrijf", company.name) : "",
      profile.fields.name ? fieldRow("Onderdeel", product.name) : "",
      profile.fields.partNumber ? fieldRow("Onderdeelnr", product.partNumber) : "",
      profile.fields.engineCode ? fieldRow("Motorcode", product.engineCode) : "",
      profile.fields.gearboxCode ? fieldRow("Bakcode", product.gearboxCode) : "",
      profile.fields.location ? fieldRow("Locatie", product.location) : "",
      profile.fields.stock ? fieldRow("Voorraad", product.stock) : "",
      profile.fields.price ? fieldRow("Prijs", `€${Number(product.price || 0).toFixed(2)}`) : "",
    ]
      .filter(Boolean)
      .join("");

    const qrHtml = profile.fields.qr
      ? `<div style="border:1px dashed #0b0f14;border-radius:10px;padding:10px;margin-top:10px;">
           <div style="font-size:12px;opacity:.7;margin-bottom:6px;">QR (simulatie)</div>
           <div style="font-family:monospace;font-size:12px;word-break:break-all;">${qrValue}</div>
         </div>`
      : "";

    w.document.write(`
      <html>
        <head>
          <title>Label ${product.partNumber}</title>
          <meta charset="utf-8" />
          <style>
            @page { margin: 12mm; }
            body { font-family: Arial, sans-serif; padding: 20px; background:#f8fafc; }
            .wrap { max-width: 900px; margin: 0 auto; }
            .label {
              width: ${pxSize.w}px; height: ${pxSize.h}px;
              background: #fff; border: 2px solid #0b0f14; border-radius: 14px;
              padding: 14px; box-sizing: border-box;
              display:flex; flex-direction:column; justify-content:space-between;
            }
            .top { display:flex; align-items:center; justify-content:space-between; gap: 10px; }
            .badge { background:#16a34a; color:#fff; padding:6px 10px; border-radius: 999px; font-weight:700; font-size:12px; }
            .meta { font-size: 12px; opacity: .75; }
            .hr { height:1px; background:#e5e7eb; margin: 10px 0; }
            .footer { font-size: 11px; opacity: .7; }
            .hint { margin-top: 14px; font-size: 12px; opacity:.75; }
            @media print {
              body { background:#fff; padding: 0; }
              .hint { display:none; }
            }
          </style>
        </head>
        <body>
          <div class="wrap">
            <div class="label">
              <div>
                <div class="top">
                  <div>
                    <div style="font-weight:900;font-size:16px;">${escapeHtml(profile.headerText || company.name)}</div>
                    <div class="meta">Labelprofiel: ${escapeHtml(profile.name)} • Formaat: ${escapeHtml(profile.size)}</div>
                  </div>
                  <div class="badge">PARTAGOS</div>
                </div>

                <div class="hr"></div>

                <div style="display:flex;flex-direction:column;gap:6px;">
                  ${fieldsHtml}
                </div>

                ${qrHtml}
              </div>

              <div class="footer">${escapeHtml(profile.footerText || "")}</div>
            </div>

            <div class="hint">
              Tip: kies in het printvenster “Opslaan als PDF” om een PDF-label te krijgen.
            </div>
          </div>

          <script>
            setTimeout(() => { window.print(); }, 250);
          </script>
        </body>
      </html>
    `);
    w.document.close();
  };

  return (
    <div style={styles.page}>
      {/* TOP BAR */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <strong>Partagos Dashboard</strong>
          <span style={styles.pill}>Demo</span>
        </div>

        <div style={styles.headerRight}>
          <select
            value={state.activeCompanyId}
            onChange={(e) => setActiveCompany(e.target.value)}
            style={styles.select}
            title="Kies bedrijf"
          >
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.country})
              </option>
            ))}
          </select>

          <button
            onClick={() => setState((s) => ({ ...s, viewMode: s.viewMode === "company" ? "pool" : "company" }))}
            style={styles.secondaryBtn}
            title="Wissel tussen eigen bedrijf en centrale pool"
          >
            View: {state.viewMode === "company" ? "Mijn bedrijf" : "Centrale pool"}
          </button>

          <button onClick={() => goTo("/")} style={styles.linkBtn} title="Terug naar landing">
            Uitloggen
          </button>
        </div>
      </header>

      {/* KPI */}
      <section style={styles.kpis}>
        <KPI label="Mijn onderdelen" value={kpi.productsCompany} />
        <KPI label="Pool onderdelen" value={kpi.productsPool} />
        <KPI label="Actieve advertenties" value={kpi.activeAds} />
        <KPI label="Magazijnen" value={kpi.warehouses} />
      </section>

      {/* MULTI-TENANT: BEDRIJF TOEVOEGEN */}
      <section style={styles.section}>
        <h2 style={styles.h2}>Multi-tenant (bedrijven)</h2>
        <p style={styles.muted}>
          Elk bedrijf beheert eigen voorraad, magazijn & labels. De “Centrale pool” combineert alle voorraad voor consumenten zoeken.
        </p>

        <div style={styles.grid2}>
          <div style={styles.card}>
            <div style={styles.cardTitle}>Nieuw bedrijf toevoegen (demo)</div>
            <div style={styles.formRow}>
              <input
                style={styles.input}
                placeholder="Bedrijfsnaam"
                value={companyDraft.name}
                onChange={(e) => setCompanyDraft((d) => ({ ...d, name: e.target.value }))}
              />
              <select
                style={styles.select}
                value={companyDraft.country}
                onChange={(e) => setCompanyDraft((d) => ({ ...d, country: e.target.value }))}
              >
                <option value="NL">NL</option>
                <option value="BE">BE</option>
                <option value="DE">DE</option>
                <option value="AE">AE</option>
                <option value="MA">MA</option>
              </select>
              <button style={styles.primaryBtn} onClick={addCompany}>
                Bedrijf toevoegen
              </button>
            </div>
            <div style={styles.smallNote}>Bedrijven blijven bewaard (localStorage) in deze browser.</div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardTitle}>Actief bedrijf</div>
            <div style={styles.bigLine}>{activeCompany?.name}</div>
            <div style={styles.smallNote}>
              Labels & voorraad die je hieronder ziet zijn{" "}
              <b>{state.viewMode === "company" ? "van dit bedrijf" : "van alle bedrijven (pool)"}</b>.
            </div>
          </div>
        </div>
      </section>

      {/* VIN / MOTOR / BAK / ONDERDEEL ZOEKEN */}
      <section style={styles.sectionAlt}>
        <h2 style={styles.h2}>Zoeken (VIN / motorcode / bakcode / onderdeelnummer) – simulatie</h2>
        <p style={styles.muted}>
          Vul een VIN in om voertuiginfo te “decoden”. Als VIN matcht, worden motor/bakfilters automatisch voorgesteld.
        </p>

        <div style={styles.searchGrid}>
          <input
            style={styles.input}
            placeholder="VIN (bijv. WVWZZZAU...)"
            value={search.vin}
            onChange={(e) => setSearch((s) => ({ ...s, vin: e.target.value }))}
          />
          <input
            style={styles.input}
            placeholder="Motorcode (bijv. CHHA)"
            value={search.engineCode}
            onChange={(e) => setSearch((s) => ({ ...s, engineCode: e.target.value }))}
          />
          <input
            style={styles.input}
            placeholder="Bakcode (bijv. RJW)"
            value={search.gearboxCode}
            onChange={(e) => setSearch((s) => ({ ...s, gearboxCode: e.target.value }))}
          />
          <input
            style={styles.input}
            placeholder="Onderdeelnummer (bijv. 0DD300045K)"
            value={search.partNumber}
            onChange={(e) => setSearch((s) => ({ ...s, partNumber: e.target.value }))}
          />
          <input
            style={styles.input}
            placeholder="Vrije zoekterm (naam/locatie)"
            value={search.q}
            onChange={(e) => setSearch((s) => ({ ...s, q: e.target.value }))}
          />
          <button
            style={styles.secondaryBtn}
            onClick={() =>
              setSearch({ vin: "", engineCode: "", gearboxCode: "", partNumber: "", q: "" })
            }
          >
            Reset
          </button>
        </div>

        <div style={styles.decodeBox}>
          <div style={styles.decodeTitle}>VIN decode resultaat</div>
          {decodedVin ? (
            <div style={styles.decodeBody}>
              <div style={styles.decodeLine}>
                <b>{decodedVin.make}</b> {decodedVin.model} ({decodedVin.year})
              </div>
              <div style={styles.decodeLine}>Motorcode: <b>{decodedVin.engineCode}</b></div>
              <div style={styles.decodeLine}>Bakcode: <b>{decodedVin.gearboxCode}</b></div>
              <div style={styles.smallNote}>{decodedVin.notes}</div>
              <div style={styles.smallNote}>
                Tip: laat motor/bak velden leeg om VIN-filters automatisch te gebruiken.
              </div>
            </div>
          ) : (
            <div style={styles.decodeBody}>
              <div style={styles.smallNote}>
                Geen match (demo). Probeer bijvoorbeeld een VIN dat start met <b>WVWZZZAU</b> of <b>WAUZZZ8V</b>.
              </div>
            </div>
          )}
        </div>
      </section>

      {/* PRODUCT TOEVOEGEN */}
      <section style={styles.section}>
        <h2 style={styles.h2}>Nieuw onderdeel toevoegen (voor actief bedrijf)</h2>

        <div style={styles.formRowWrap}>
          <input
            style={styles.input}
            placeholder="Onderdeelnaam"
            value={productDraft.name}
            onChange={(e) => setProductDraft((d) => ({ ...d, name: e.target.value }))}
          />
          <input
            style={styles.input}
            placeholder="Onderdeelnummer"
            value={productDraft.partNumber}
            onChange={(e) => setProductDraft((d) => ({ ...d, partNumber: e.target.value }))}
          />
          <input
            style={styles.input}
            placeholder="Motorcode"
            value={productDraft.engineCode}
            onChange={(e) => setProductDraft((d) => ({ ...d, engineCode: e.target.value }))}
          />
          <input
            style={styles.input}
            placeholder="Bakcode"
            value={productDraft.gearboxCode}
            onChange={(e) => setProductDraft((d) => ({ ...d, gearboxCode: e.target.value }))}
          />
          <input
            style={styles.input}
            placeholder="Locatie (magazijn/rek/vak)"
            value={productDraft.location}
            onChange={(e) => setProductDraft((d) => ({ ...d, location: e.target.value }))}
          />
          <input
            style={styles.input}
            placeholder="Prijs (consument) €"
            type="number"
            value={productDraft.price}
            onChange={(e) => setProductDraft((d) => ({ ...d, price: e.target.value }))}
          />
          <input
            style={styles.input}
            placeholder="Voorraad"
            type="number"
            value={productDraft.stock}
            onChange={(e) => setProductDraft((d) => ({ ...d, stock: e.target.value }))}
          />
          <button style={styles.primaryBtn} onClick={addProduct}>
            Toevoegen
          </button>
        </div>

        <div style={styles.smallNote}>
          Let op: in demo worden onderdelen bewaard in <b>localStorage</b>. In productie komt dit uit de database (Supabase).
        </div>
      </section>

      {/* PRODUCTEN TABEL */}
      <section style={styles.section}>
        <div style={styles.rowBetween}>
          <div>
            <h2 style={styles.h2}>
              {state.viewMode === "company" ? "Mijn voorraad" : "Centrale pool (alle bedrijven)"}
            </h2>
            <div style={styles.smallNote}>
              Resultaten: <b>{filteredProducts.length}</b>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={styles.smallNote}>Labelprofiel:</div>
            <select
              style={styles.select}
              value={activeLabelProfile?.id || ""}
              onChange={(e) => setActiveLabelProfileId(e.target.value)}
            >
              {labelProfilesForCompany.length === 0 ? (
                <option value="">(geen profielen)</option>
              ) : (
                labelProfilesForCompany.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.size})
                  </option>
                ))
              )}
            </select>
            <button style={styles.secondaryBtn} onClick={createNewLabelProfile}>
              + Nieuw labelprofiel
            </button>
          </div>
        </div>

        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Bedrijf</th>
                <th>Onderdeel</th>
                <th>Onderdeelnummer</th>
                <th>Motor</th>
                <th>Bak</th>
                <th>Locatie</th>
                <th>Voorraad</th>
                <th>Prijs</th>
                <th>Kanalen</th>
                <th>Label</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => {
                const c = state.companies.find((x) => x.id === p.companyId);
                return (
                  <tr key={p.id}>
                    <td>{c?.name || p.companyId}</td>
                    <td>{p.name}</td>
                    <td style={{ fontFamily: "monospace" }}>{p.partNumber}</td>
                    <td>{p.engineCode}</td>
                    <td>{p.gearboxCode}</td>
                    <td>{p.location}</td>
                    <td>{p.stock}</td>
                    <td>€{Number(p.price || 0).toFixed(2)}</td>
                    <td>
                      <div style={styles.channelsGrid}>
                        {["partagos", "marktplaats", "ebay", "rrr"].map((k) => (
                          <label key={k} style={styles.channelPill}>
                            <input
                              type="checkbox"
                              checked={!!(p.channels && p.channels[k])}
                              onChange={() => toggleChannel(p.id, k)}
                            />
                            <span>{k}</span>
                          </label>
                        ))}
                      </div>
                    </td>
                    <td>
                      <button style={styles.primaryBtnSmall} onClick={() => openLabel(p.id)}>
                        Preview label
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={10} style={styles.empty}>
                    Geen resultaten. Pas filters aan of zet View op “Centrale pool”.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* LABEL MODAL */}
      {labelEditorOpen && selectedProduct && activeLabelProfile && (
        <Modal onClose={() => setLabelEditorOpen(false)} title="Label preview + PDF">
          <LabelEditor
            product={selectedProduct}
            company={state.companies.find((c) => c.id === selectedProduct.companyId) || activeCompany}
            profile={activeLabelProfile}
            onChangeProfile={upsertLabelProfile}
            onPrint={() =>
              printLabelAsPDF({
                product: selectedProduct,
                profile: activeLabelProfile,
                company:
                  state.companies.find((c) => c.id === selectedProduct.companyId) || activeCompany,
              })
            }
          />
        </Modal>
      )}

      <footer style={styles.footer}>
        Demo dashboard – data in localStorage. Volgende stap: Supabase + echte multi-tenant auth.
      </footer>
    </div>
  );
}

function KPI({ label, value }) {
  return (
    <div style={styles.kpi}>
      <div style={styles.kpiValue}>{value}</div>
      <div style={styles.kpiLabel}>{label}</div>
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div style={styles.modalOverlay} onMouseDown={onClose}>
      <div style={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <strong>{title}</strong>
          <button style={styles.linkBtn} onClick={onClose}>
            Sluiten
          </button>
        </div>
        <div style={styles.modalBody}>{children}</div>
      </div>
    </div>
  );
}

function LabelEditor({ product, company, profile, onChangeProfile, onPrint }) {
  const [draft, setDraft] = useState(profile);

  useEffect(() => setDraft(profile), [profile]);

  const setField = (key, val) => {
    setDraft((d) => ({ ...d, fields: { ...d.fields, [key]: val } }));
  };

  const apply = () => {
    onChangeProfile(draft);
  };

  const preview = useMemo(() => {
    const show = draft.fields || {};
    const lines = [];
    if (show.companyName) lines.push(["Bedrijf", company.name]);
    if (show.name) lines.push(["Onderdeel", product.name]);
    if (show.partNumber) lines.push(["Onderdeelnr", product.partNumber]);
    if (show.engineCode) lines.push(["Motorcode", product.engineCode]);
    if (show.gearboxCode) lines.push(["Bakcode", product.gearboxCode]);
    if (show.location) lines.push(["Locatie", product.location]);
    if (show.stock) lines.push(["Voorraad", String(product.stock)]);
    if (show.price) lines.push(["Prijs", `€${Number(product.price || 0).toFixed(2)}`]);

    const qrValue = `PARTAGOS|${company.id}|${product.id}|${product.partNumber}`;

    return { lines, qrValue };
  }, [draft, product, company]);

  return (
    <div style={styles.labelGrid}>
      {/* Left: Editor */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>Labelprofiel aanpassen (demo)</div>

        <div style={styles.formRowWrap}>
          <input
            style={styles.input}
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            placeholder="Profielnaam"
          />
          <select
            style={styles.select}
            value={draft.size}
            onChange={(e) => setDraft((d) => ({ ...d, size: e.target.value }))}
          >
            <option value="58x40">58x40</option>
            <option value="100x50">100x50</option>
          </select>
          <input
            style={styles.input}
            value={draft.headerText}
            onChange={(e) => setDraft((d) => ({ ...d, headerText: e.target.value }))}
            placeholder="Header tekst"
          />
          <input
            style={styles.input}
            value={draft.footerText}
            onChange={(e) => setDraft((d) => ({ ...d, footerText: e.target.value }))}
            placeholder="Footer tekst"
          />
        </div>

        <div style={styles.cardTitle}>Velden op label</div>
        <div style={styles.fieldsGrid}>
          {[
            ["companyName", "Bedrijf"],
            ["name", "Onderdeel"],
            ["partNumber", "Onderdeelnr"],
            ["engineCode", "Motorcode"],
            ["gearboxCode", "Bakcode"],
            ["location", "Locatie"],
            ["stock", "Voorraad"],
            ["price", "Prijs"],
            ["qr", "QR (simulatie)"],
          ].map(([k, label]) => (
            <label key={k} style={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={!!draft.fields?.[k]}
                onChange={(e) => setField(k, e.target.checked)}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button style={styles.primaryBtn} onClick={apply}>
            Opslaan profiel
          </button>
          <button style={styles.secondaryBtn} onClick={onPrint}>
            Print / Save as PDF
          </button>
        </div>

        <div style={styles.smallNote}>
          PDF = via browser print. Kies “Opslaan als PDF” in het printvenster.
        </div>
      </div>

      {/* Right: Preview */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>Sticker preview</div>
        <div style={styles.previewWrap}>
          <div
            style={{
              ...styles.sticker,
              width: draft.size === "100x50" ? 520 : 420,
              height: draft.size === "100x50" ? 260 : 290,
            }}
          >
            <div style={styles.stickerTop}>
              <div>
                <div style={styles.stickerHeader}>{draft.headerText || company.name}</div>
                <div style={styles.stickerMeta}>
                  {draft.name} • {draft.size}
                </div>
              </div>
              <div style={styles.badge}>PARTAGOS</div>
            </div>

            <div style={styles.hr} />

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {preview.lines.map(([k, v]) => (
                <div key={k} style={{ display: "flex", gap: 10 }}>
                  <div style={{ minWidth: 110, opacity: 0.7 }}>{k}</div>
                  <div style={{ fontWeight: 800 }}>{v}</div>
                </div>
              ))}
            </div>

            {draft.fields?.qr && (
              <div style={styles.qrBox}>
                <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>QR (simulatie)</div>
                <div style={{ fontFamily: "monospace", fontSize: 12, wordBreak: "break-all" }}>
                  {preview.qrValue}
                </div>
              </div>
            )}

            <div style={styles.stickerFooter}>{draft.footerText || ""}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* ---------------- STYLES ---------------- */

const styles = {
  page: {
    padding: 20,
    background: "#f8fafc",
    minHeight: "100vh",
    fontFamily: "Arial, sans-serif",
  },

  header: {
    background: "#ffffff",
    padding: 16,
    borderRadius: 10,
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 20,
    border: "1px solid #e5e7eb",
  },
  headerLeft: { display: "flex", gap: 10, alignItems: "center" },
  pill: {
    fontSize: 12,
    background: "#eefdf5",
    border: "1px solid #bbf7d0",
    padding: "3px 8px",
    borderRadius: 999,
    color: "#166534",
    fontWeight: 700,
  },
  headerRight: { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" },

  kpis: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 12,
    marginBottom: 24,
  },
  kpi: { background: "#fff", padding: 16, borderRadius: 10, border: "1px solid #e5e7eb" },
  kpiValue: { fontSize: 24, fontWeight: "bold", color: "#16a34a" },
  kpiLabel: { fontSize: 13, opacity: 0.7 },

  section: { background: "#fff", padding: 20, borderRadius: 12, marginBottom: 20, border: "1px solid #e5e7eb" },
  sectionAlt: { background: "#eefdf5", padding: 20, borderRadius: 12, marginBottom: 20, border: "1px solid #bbf7d0" },

  h2: { margin: "0 0 8px" },
  muted: { fontSize: 13, opacity: 0.75, marginBottom: 12 },

  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  card: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 14 },
  cardTitle: { fontWeight: 800, marginBottom: 10 },

  bigLine: { fontSize: 18, fontWeight: 900, margin: "6px 0 0" },

  formRow: { display: "grid", gridTemplateColumns: "1fr 120px 170px", gap: 10, alignItems: "center" },
  formRowWrap: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, alignItems: "center" },

  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #d1d5db",
    outline: "none",
    background: "#fff",
  },
  select: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #d1d5db",
    outline: "none",
    background: "#fff",
  },

  primaryBtn: {
    background: "#16a34a",
    color: "#fff",
    padding: "10px 14px",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    fontWeight: 800,
    whiteSpace: "nowrap",
  },
  primaryBtnSmall: {
    background: "#16a34a",
    color: "#fff",
    padding: "8px 10px",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    fontWeight: 800,
    whiteSpace: "nowrap",
    fontSize: 12,
  },
  secondaryBtn: {
    border: "1px solid #d1d5db",
    background: "#fff",
    padding: "10px 14px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 800,
    whiteSpace: "nowrap",
  },
  linkBtn: {
    background: "none",
    border: "none",
    color: "#16a34a",
    cursor: "pointer",
    fontWeight: 900,
    padding: "6px 8px",
  },

  smallNote: { marginTop: 8, fontSize: 12, opacity: 0.7 },

  searchGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10, alignItems: "center" },

  decodeBox: { marginTop: 12, background: "#fff", border: "1px solid #bbf7d0", borderRadius: 12, overflow: "hidden" },
  decodeTitle: { padding: 12, fontWeight: 900, background: "#f0fdf4" },
  decodeBody: { padding: 12 },
  decodeLine: { marginBottom: 6 },

  rowBetween: { display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" },

  tableWrap: { marginTop: 10, overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", minWidth: 1100 },
  empty: { textAlign: "center", padding: 18, opacity: 0.7 },

  channelsGrid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 6 },
  channelPill: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    border: "1px solid #e5e7eb",
    borderRadius: 999,
    padding: "6px 10px",
    fontSize: 12,
    background: "#fff",
  },

  footer: { textAlign: "center", fontSize: 12, opacity: 0.6, marginTop: 24 },

  // Modal
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    zIndex: 999,
  },
  modal: { width: "min(1100px, 96vw)", background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "hidden" },
  modalHeader: { padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e5e7eb" },
  modalBody: { padding: 14 },

  // Label editor
  labelGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  fieldsGrid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 },
  checkboxRow: { display: "flex", gap: 8, alignItems: "center", fontSize: 13 },

  previewWrap: { display: "flex", justifyContent: "center", padding: 12, background: "#f8fafc", borderRadius: 12, border: "1px dashed #d1d5db" },
  sticker: {
    background: "#fff",
    borderRadius: 14,
    border: "2px solid #0b0f14",
    padding: 14,
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  stickerTop: { display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" },
  stickerHeader: { fontSize: 16, fontWeight: 900 },
  stickerMeta: { fontSize: 12, opacity: 0.75 },
  badge: { background: "#16a34a", color: "#fff", padding: "6px 10px", borderRadius: 999, fontWeight: 900, fontSize: 12 },
  hr: { height: 1, background: "#e5e7eb", margin: "10px 0" },
  qrBox: { border: "1px dashed #0b0f14", borderRadius: 10, padding: 10, marginTop: 10 },
  stickerFooter: { fontSize: 11, opacity: 0.7, marginTop: 10 },
};
