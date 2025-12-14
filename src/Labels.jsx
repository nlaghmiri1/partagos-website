import React from "react";
import { supabase } from "./supabaseClient";
import LabelEditor from "./LabelEditor";
import LabelPreview from "./LabelPreview";
import { exportLabelToPdf } from "./labelPdf";

function safeArray(v) {
  return Array.isArray(v) ? v : [];
}

const PRESETS = [
  { name: "Dymo 11352 (54×25mm)", width_mm: 54, height_mm: 25 },
  { name: "Dymo 99012 (89×36mm)", width_mm: 89, height_mm: 36 },
  { name: "Thermal (100×50mm)", width_mm: 100, height_mm: 50 },
  { name: "Thermal (57×32mm)", width_mm: 57, height_mm: 32 },
  { name: "Thermal (50×25mm)", width_mm: 50, height_mm: 25 },
];

const DEFAULT_ELEMENTS = (companyName = "Bedrijf") => ([
  {
    id: crypto.randomUUID?.() || String(Date.now()),
    type: "text",
    x: 4, y: 4, w: 46, h: 6,
    value: "{{product.name}}",
    fontSize: 9,
    fontWeight: 700,
    align: "left"
  },
  {
    id: crypto.randomUUID?.() || String(Date.now() + 1),
    type: "text",
    x: 4, y: 11, w: 30, h: 5,
    value: "PN: {{product.part_number}}",
    fontSize: 7,
    fontWeight: 600,
    align: "left"
  },
  {
    id: crypto.randomUUID?.() || String(Date.now() + 2),
    type: "qr",
    x: 40, y: 8, w: 13, h: 13,
    value: "{{product.id}}",
  },
  {
    id: crypto.randomUUID?.() || String(Date.now() + 3),
    type: "barcode",
    x: 4, y: 17, w: 35, h: 7,
    value: "{{product.part_number}}",
    format: "CODE128",
    text: false
  },
  {
    id: crypto.randomUUID?.() || String(Date.now() + 4),
    type: "text",
    x: 4, y: 22.2, w: 46, h: 2.5,
    value: `${companyName}`,
    fontSize: 6,
    fontWeight: 600,
    align: "left",
    opacity: 0.55
  }
]);

export default function Labels({ company, selectedProduct }) {
  const [loading, setLoading] = React.useState(true);
  const [templates, setTemplates] = React.useState([]);
  const [activeTemplate, setActiveTemplate] = React.useState(null);
  const [mode, setMode] = React.useState("editor"); // editor | preview
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (!company?.id) return;
    loadTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company?.id]);

  async function loadTemplates() {
    setLoading(true);
    const { data, error } = await supabase
      .from("label_templates")
      .select("*")
      .eq("company_id", company.id)
      .order("created_at", { ascending: false });

    if (error) console.error(error);

    let list = safeArray(data);

    // Auto-seed: als er nog geen templates zijn, maak 2-3 gangbare
    if (list.length === 0) {
      const seed = [
        {
          company_id: company.id,
          name: "Standaard magazijnlabel (Dymo 99012)",
          width_mm: 89,
          height_mm: 36,
          elements: DEFAULT_ELEMENTS(company.name),
          is_default: true
        },
        {
          company_id: company.id,
          name: "Klein onderdeel label (54×25)",
          width_mm: 54,
          height_mm: 25,
          elements: DEFAULT_ELEMENTS(company.name),
          is_default: true
        },
        {
          company_id: company.id,
          name: "Dooslabel (100×50)",
          width_mm: 100,
          height_mm: 50,
          elements: DEFAULT_ELEMENTS(company.name),
          is_default: true
        }
      ];

      const { data: inserted, error: insErr } = await supabase
        .from("label_templates")
        .insert(seed.map(s => ({ ...s, elements: JSON.stringify(s.elements) })))
        .select("*");

      if (insErr) console.error(insErr);
      list = safeArray(inserted);
    }

    setTemplates(list);
    setActiveTemplate(list[0] || null);
    setLoading(false);
  }

  async function createFromPreset(preset) {
    setBusy(true);
    const payload = {
      company_id: company.id,
      name: `Nieuw label (${preset.name})`,
      width_mm: preset.width_mm,
      height_mm: preset.height_mm,
      elements: JSON.stringify(DEFAULT_ELEMENTS(company.name)),
      is_default: false
    };

    const { data, error } = await supabase
      .from("label_templates")
      .insert([payload])
      .select("*")
      .single();

    if (error) alert(error.message);
    await loadTemplates();
    setActiveTemplate(data);
    setBusy(false);
  }

  async function duplicateTemplate(tpl) {
    setBusy(true);
    const payload = {
      company_id: company.id,
      name: `${tpl.name} (kopie)`,
      width_mm: tpl.width_mm,
      height_mm: tpl.height_mm,
      elements: tpl.elements,
      is_default: false
    };

    const { data, error } = await supabase
      .from("label_templates")
      .insert([payload])
      .select("*")
      .single();

    if (error) alert(error.message);
    await loadTemplates();
    setActiveTemplate(data);
    setBusy(false);
  }

  async function deleteTemplate(tpl) {
    if (!confirm(`Verwijder template: "${tpl.name}"?`)) return;
    setBusy(true);
    const { error } = await supabase.from("label_templates").delete().eq("id", tpl.id);
    if (error) alert(error.message);
    await loadTemplates();
    setBusy(false);
  }

  async function saveTemplate(updated) {
    setBusy(true);
    const payload = {
      name: updated.name,
      width_mm: updated.width_mm,
      height_mm: updated.height_mm,
      elements: JSON.stringify(updated.elements),
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase.from("label_templates").update(payload).eq("id", updated.id);
    if (error) alert(error.message);

    // Update local state fast
    setTemplates(prev => prev.map(t => (t.id === updated.id ? { ...t, ...payload, elements: payload.elements } : t)));
    setActiveTemplate(prev => (prev?.id === updated.id ? { ...prev, ...payload, elements: payload.elements } : prev));
    setBusy(false);
  }

  async function exportPdf() {
    if (!activeTemplate) return;
    if (!selectedProduct) {
      alert("Selecteer eerst een product in het dashboard (voor dynamische velden).");
      return;
    }

    setBusy(true);

    const tpl = normalizeTemplate(activeTemplate);
    const context = {
      company,
      product: selectedProduct,
      date: new Date().toISOString().slice(0, 10)
    };

    try {
      await exportLabelToPdf({ template: tpl, context, fileName: `${tpl.name}.pdf` });
    } catch (e) {
      alert(e?.message || String(e));
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="text-sm text-slate-600">Labels laden…</div>;
  if (!activeTemplate) return <div className="text-sm text-slate-600">Geen templates gevonden.</div>;

  const tpl = normalizeTemplate(activeTemplate);

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
        <div>
          <div className="text-lg font-bold">Labels</div>
          <div className="text-xs text-slate-500">
            Dymo/Zebra magazijnlabels met editor + PDF export. Per bedrijf eigen templates.
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            className={`px-4 py-2 rounded-xl border bg-white ${mode === "editor" ? "ring-2 ring-emerald-500" : ""}`}
            onClick={() => setMode("editor")}
          >
            Editor
          </button>
          <button
            className={`px-4 py-2 rounded-xl border bg-white ${mode === "preview" ? "ring-2 ring-emerald-500" : ""}`}
            onClick={() => setMode("preview")}
          >
            Preview
          </button>
          <button className="px-4 py-2 rounded-xl bg-emerald-600 text-white" onClick={exportPdf} disabled={busy}>
            Export PDF (print)
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[360px_1fr] gap-4">
        <div className="bg-white border rounded-2xl p-4 space-y-4">
          <div>
            <div className="text-sm font-semibold mb-2">Templates</div>
            <select
              className="w-full border rounded-xl px-3 py-2"
              value={activeTemplate.id}
              onChange={(e) => setActiveTemplate(templates.find(t => t.id === e.target.value))}
            >
              {templates.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name} {t.is_default ? "• default" : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            <button className="px-3 py-2 rounded-xl border bg-white" onClick={() => duplicateTemplate(activeTemplate)} disabled={busy}>
              Kopieer
            </button>
            <button className="px-3 py-2 rounded-xl border bg-white" onClick={() => deleteTemplate(activeTemplate)} disabled={busy || activeTemplate.is_default}>
              Verwijder
            </button>
            <button className="px-3 py-2 rounded-xl border bg-white" onClick={loadTemplates} disabled={busy}>
              Refresh
            </button>
          </div>

          <div className="border rounded-xl p-3 bg-slate-50">
            <div className="text-sm font-semibold">Nieuw label (preset)</div>
            <div className="text-xs text-slate-600 mt-1">Maak een nieuw template op basis van een gangbaar formaat.</div>
            <div className="mt-2 grid grid-cols-1 gap-2">
              {PRESETS.map(p => (
                <button
                  key={p.name}
                  className="px-3 py-2 rounded-xl border bg-white text-left"
                  onClick={() => createFromPreset(p)}
                  disabled={busy}
                >
                  <div className="font-semibold text-sm">{p.name}</div>
                  <div className="text-xs text-slate-500">{p.width_mm}×{p.height_mm} mm</div>
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-slate-500">
            Tip: Selecteer een product in “Onderdelen” voordat je PDF export doet, zodat velden zoals
            <code className="px-1">{"{{product.part_number}}"}</code> gevuld worden.
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-4">
          {mode === "editor" ? (
            <LabelEditor
              company={company}
              selectedProduct={selectedProduct}
              template={tpl}
              onSave={saveTemplate}
              busy={busy}
            />
          ) : (
            <LabelPreview
              company={company}
              selectedProduct={selectedProduct}
              template={tpl}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function normalizeTemplate(tpl) {
  let elements = tpl.elements;
  if (typeof elements === "string") {
    try { elements = JSON.parse(elements); } catch { elements = []; }
  }
  if (!Array.isArray(elements)) elements = [];
  return {
    ...tpl,
    width_mm: Number(tpl.width_mm),
    height_mm: Number(tpl.height_mm),
    elements
  };
}
