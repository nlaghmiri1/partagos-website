import React from "react";
import QRCode from "qrcode";

const TOOLBOX = [
  { type: "text", label: "Tekst" },
  { type: "qr", label: "QR" },
  { type: "barcode", label: "Barcode" },
  { type: "logo", label: "Logo" },
];

const FIELDS = [
  "{{company.name}}",
  "{{product.name}}",
  "{{product.part_number}}",
  "{{product.engine_code}}",
  "{{product.gearbox_code}}",
  "{{product.location}}",
  "{{product.id}}",
  "{{date}}",
];

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function mmToPx(mm, pxPerMm) {
  return mm * pxPerMm;
}

function hitResizeHandle(px, py, rect) {
  const s = 10;
  const hx = rect.x + rect.w - s;
  const hy = rect.y + rect.h - s;
  return px >= hx && px <= rect.x + rect.w && py >= hy && py <= rect.y + rect.h;
}

export default function LabelEditor({ company, selectedProduct, template, onSave, busy }) {
  const [draft, setDraft] = React.useState(template);
  const [selectedId, setSelectedId] = React.useState(template.elements[0]?.id || null);
  const [tool, setTool] = React.useState("select");
  const [snap, setSnap] = React.useState(1); // mm grid
  const [zoom, setZoom] = React.useState(6); // px per mm
  const containerRef = React.useRef(null);

  const dragRef = React.useRef({
    mode: null, // "move" | "resize"
    startX: 0,
    startY: 0,
    startEl: null,
  });

  React.useEffect(() => {
    setDraft(template);
    setSelectedId(template.elements[0]?.id || null);
  }, [template.id]); // when switching templates

  const pxPerMm = zoom;
  const canvasW = mmToPx(draft.width_mm, pxPerMm);
  const canvasH = mmToPx(draft.height_mm, pxPerMm);

  const selectedEl = draft.elements.find(e => e.id === selectedId) || null;

  function updateSelected(patch) {
    setDraft(prev => ({
      ...prev,
      elements: prev.elements.map(e => e.id === selectedId ? { ...e, ...patch } : e)
    }));
  }

  function addElement(type) {
    const id = crypto.randomUUID?.() || String(Date.now());
    const base = { id, type, x: 4, y: 4, w: 20, h: 10 };

    let el = base;

    if (type === "text") el = { ...base, w: 35, h: 6, value: "{{product.name}}", fontSize: 9, fontWeight: 700, align: "left" };
    if (type === "qr") el = { ...base, w: 14, h: 14, value: "{{product.id}}" };
    if (type === "barcode") el = { ...base, w: 40, h: 10, value: "{{product.part_number}}", format: "CODE128", text: false };
    if (type === "logo") el = { ...base, w: 18, h: 10, value: "" }; // dataURL later

    setDraft(prev => ({ ...prev, elements: [...prev.elements, el] }));
    setSelectedId(id);
    setTool("select");
  }

  function removeSelected() {
    if (!selectedId) return;
    setDraft(prev => ({ ...prev, elements: prev.elements.filter(e => e.id !== selectedId) }));
    setSelectedId(null);
  }

  function bringForward() {
    if (!selectedId) return;
    setDraft(prev => {
      const idx = prev.elements.findIndex(e => e.id === selectedId);
      if (idx < 0 || idx === prev.elements.length - 1) return prev;
      const copy = [...prev.elements];
      const [it] = copy.splice(idx, 1);
      copy.splice(idx + 1, 0, it);
      return { ...prev, elements: copy };
    });
  }

  function sendBackward() {
    if (!selectedId) return;
    setDraft(prev => {
      const idx = prev.elements.findIndex(e => e.id === selectedId);
      if (idx <= 0) return prev;
      const copy = [...prev.elements];
      const [it] = copy.splice(idx, 1);
      copy.splice(idx - 1, 0, it);
      return { ...prev, elements: copy };
    });
  }

  function onMouseDown(e) {
    const rect = containerRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    // find topmost element under cursor (reverse order)
    const hit = [...draft.elements].reverse().find(el => {
      const x = el.x * pxPerMm;
      const y = el.y * pxPerMm;
      const w = el.w * pxPerMm;
      const h = el.h * pxPerMm;
      return px >= x && px <= x + w && py >= y && py <= y + h;
    });

    if (!hit) {
      setSelectedId(null);
      return;
    }

    setSelectedId(hit.id);

    const elRect = {
      x: hit.x * pxPerMm,
      y: hit.y * pxPerMm,
      w: hit.w * pxPerMm,
      h: hit.h * pxPerMm
    };

    const isResize = hitResizeHandle(px, py, elRect);
    dragRef.current.mode = isResize ? "resize" : "move";
    dragRef.current.startX = px;
    dragRef.current.startY = py;
    dragRef.current.startEl = { ...hit };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }

  function onMouseMove(e) {
    const rect = containerRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const dxPx = px - dragRef.current.startX;
    const dyPx = py - dragRef.current.startY;
    const dxMm = dxPx / pxPerMm;
    const dyMm = dyPx / pxPerMm;

    const start = dragRef.current.startEl;
    if (!start) return;

    if (dragRef.current.mode === "move") {
      const nx = snapTo(start.x + dxMm, snap);
      const ny = snapTo(start.y + dyMm, snap);

      updateById(start.id, {
        x: clamp(nx, 0, draft.width_mm - start.w),
        y: clamp(ny, 0, draft.height_mm - start.h)
      });
    }

    if (dragRef.current.mode === "resize") {
      const nw = snapTo(start.w + dxMm, snap);
      const nh = snapTo(start.h + dyMm, snap);

      updateById(start.id, {
        w: clamp(nw, 4, draft.width_mm - start.x),
        h: clamp(nh, 4, draft.height_mm - start.y)
      });
    }
  }

  function onMouseUp() {
    dragRef.current.mode = null;
    dragRef.current.startEl = null;
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  }

  function updateById(id, patch) {
    setDraft(prev => ({ ...prev, elements: prev.elements.map(e => e.id === id ? { ...e, ...patch } : e) }));
  }

  async function uploadLogoFile(file) {
    const dataUrl = await fileToDataUrl(file);
    updateSelected({ value: dataUrl });
  }

  async function save() {
    await onSave(draft);
  }

  return (
    <div className="grid xl:grid-cols-[1fr_360px] gap-5">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex gap-2 flex-wrap">
            <button className={`px-3 py-2 rounded-xl border bg-white ${tool === "select" ? "ring-2 ring-emerald-500" : ""}`} onClick={() => setTool("select")}>
              Select
            </button>
            {TOOLBOX.map(t => (
              <button
                key={t.type}
                className="px-3 py-2 rounded-xl bg-slate-900 text-white"
                onClick={() => addElement(t.type)}
                disabled={busy}
              >
                + {t.label}
              </button>
            ))}

            <button className="px-3 py-2 rounded-xl border bg-white" onClick={removeSelected} disabled={!selectedId || busy}>
              Verwijder
            </button>

            <button className="px-3 py-2 rounded-xl border bg-white" onClick={sendBackward} disabled={!selectedId || busy}>
              Naar achter
            </button>
            <button className="px-3 py-2 rounded-xl border bg-white" onClick={bringForward} disabled={!selectedId || busy}>
              Naar voren
            </button>
          </div>

          <div className="flex gap-2 flex-wrap">
            <div className="text-xs text-slate-500 self-center">Grid</div>
            <select className="border rounded-xl px-3 py-2 text-sm" value={snap} onChange={(e) => setSnap(Number(e.target.value))}>
              <option value={0.5}>0.5mm</option>
              <option value={1}>1mm</option>
              <option value={2}>2mm</option>
            </select>

            <div className="text-xs text-slate-500 self-center">Zoom</div>
            <select className="border rounded-xl px-3 py-2 text-sm" value={zoom} onChange={(e) => setZoom(Number(e.target.value))}>
              <option value={4}>4 px/mm</option>
              <option value={6}>6 px/mm</option>
              <option value={8}>8 px/mm</option>
              <option value={10}>10 px/mm</option>
            </select>

            <button className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold" onClick={save} disabled={busy}>
              Opslaan template
            </button>
          </div>
        </div>

        <div className="text-xs text-slate-500 mb-3">
          Canvas: {draft.width_mm}×{draft.height_mm} mm — sleep elementen, resize rechtsonder. Velden zoals <code className="px-1">{"{{product.part_number}}"}</code> worden gevuld bij PDF export.
        </div>

        <div
          ref={containerRef}
          className="relative border rounded-2xl bg-white overflow-hidden select-none"
          style={{
            width: canvasW,
            height: canvasH,
            backgroundImage: snap ? `linear-gradient(to right, rgba(15,23,42,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.06) 1px, transparent 1px)` : "none",
            backgroundSize: `${snap * pxPerMm}px ${snap * pxPerMm}px`,
          }}
          onMouseDown={onMouseDown}
        >
          {draft.elements.map((el) => (
            <ElementBox
              key={el.id}
              el={el}
              selected={el.id === selectedId}
              pxPerMm={pxPerMm}
              company={company}
              product={selectedProduct}
            />
          ))}
        </div>
      </div>

      <div className="border rounded-2xl p-4 bg-slate-50">
        <div className="font-semibold">Eigenschappen</div>
        <div className="text-xs text-slate-600 mt-1">
          Selecteer een element om eigenschappen te bewerken.
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <div className="text-sm font-semibold">Template naam</div>
            <input
              className="w-full border rounded-xl px-3 py-2 mt-1"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-sm font-semibold">Breedte (mm)</div>
              <input
                type="number"
                className="w-full border rounded-xl px-3 py-2 mt-1"
                value={draft.width_mm}
                onChange={(e) => setDraft({ ...draft, width_mm: Number(e.target.value) })}
              />
            </div>
            <div>
              <div className="text-sm font-semibold">Hoogte (mm)</div>
              <input
                type="number"
                className="w-full border rounded-xl px-3 py-2 mt-1"
                value={draft.height_mm}
                onChange={(e) => setDraft({ ...draft, height_mm: Number(e.target.value) })}
              />
            </div>
          </div>

          {selectedEl ? (
            <div className="border rounded-xl bg-white p-3">
              <div className="text-sm font-semibold">Element: {selectedEl.type}</div>

              <div className="grid grid-cols-2 gap-2 mt-3">
                <Num label="x (mm)" value={selectedEl.x} onChange={(v) => updateSelected({ x: v })} />
                <Num label="y (mm)" value={selectedEl.y} onChange={(v) => updateSelected({ y: v })} />
                <Num label="w (mm)" value={selectedEl.w} onChange={(v) => updateSelected({ w: v })} />
                <Num label="h (mm)" value={selectedEl.h} onChange={(v) => updateSelected({ h: v })} />
              </div>

              {(selectedEl.type === "text") && (
                <>
                  <div className="mt-3">
                    <div className="text-sm font-semibold">Tekst</div>
                    <input
                      className="w-full border rounded-xl px-3 py-2 mt-1"
                      value={selectedEl.value || ""}
                      onChange={(e) => updateSelected({ value: e.target.value })}
                    />
                    <div className="mt-2 flex flex-wrap gap-2">
                      {FIELDS.map(f => (
                        <button key={f} className="text-xs px-2 py-1 rounded-lg border bg-white" onClick={() => updateSelected({ value: f })}>
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <Num label="Font size" value={selectedEl.fontSize ?? 9} onChange={(v) => updateSelected({ fontSize: v })} />
                    <Num label="Weight" value={selectedEl.fontWeight ?? 700} onChange={(v) => updateSelected({ fontWeight: v })} />
                  </div>

                  <div className="mt-3">
                    <div className="text-sm font-semibold">Align</div>
                    <select
                      className="w-full border rounded-xl px-3 py-2 mt-1"
                      value={selectedEl.align || "left"}
                      onChange={(e) => updateSelected({ align: e.target.value })}
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                </>
              )}

              {(selectedEl.type === "qr") && (
                <div className="mt-3">
                  <div className="text-sm font-semibold">QR waarde</div>
                  <input
                    className="w-full border rounded-xl px-3 py-2 mt-1"
                    value={selectedEl.value || ""}
                    onChange={(e) => updateSelected({ value: e.target.value })}
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    {FIELDS.map(f => (
                      <button key={f} className="text-xs px-2 py-1 rounded-lg border bg-white" onClick={() => updateSelected({ value: f })}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {(selectedEl.type === "barcode") && (
                <div className="mt-3">
                  <div className="text-sm font-semibold">Barcode waarde</div>
                  <input
                    className="w-full border rounded-xl px-3 py-2 mt-1"
                    value={selectedEl.value || ""}
                    onChange={(e) => updateSelected({ value: e.target.value })}
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    {FIELDS.map(f => (
                      <button key={f} className="text-xs px-2 py-1 rounded-lg border bg-white" onClick={() => updateSelected({ value: f })}>
                        {f}
                      </button>
                    ))}
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!selectedEl.text}
                      onChange={(e) => updateSelected({ text: e.target.checked })}
                    />
                    <div className="text-sm">Toon tekst onder barcode</div>
                  </div>
                </div>
              )}

              {(selectedEl.type === "logo") && (
                <div className="mt-3">
                  <div className="text-sm font-semibold">Logo</div>
                  <input
                    className="w-full text-sm mt-2"
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && uploadLogoFile(e.target.files[0])}
                  />
                  <div className="text-xs text-slate-500 mt-2">Logo wordt in template opgeslagen als image (dataURL).</div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-slate-600 mt-3">Geen element geselecteerd.</div>
          )}

          <div className="border rounded-xl bg-white p-3">
            <div className="text-sm font-semibold">Snelvelden</div>
            <div className="text-xs text-slate-600 mt-1">
              Klik om te kopiëren naar je tekst/qr/barcode element.
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {FIELDS.map(f => (
                <button
                  key={f}
                  className="text-xs px-2 py-1 rounded-lg border bg-white"
                  onClick={async () => {
                    await navigator.clipboard.writeText(f);
                    alert("Veld gekopieerd naar clipboard.");
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="border rounded-xl bg-white p-3">
            <div className="text-sm font-semibold">Preview QR (actief product)</div>
            <div className="text-xs text-slate-600 mt-1">Snelle check of QR werkt met jouw data.</div>
            <QrMini company={company} product={selectedProduct} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Num({ label, value, onChange }) {
  return (
    <div>
      <div className="text-xs text-slate-500">{label}</div>
      <input
        type="number"
        step="0.5"
        className="w-full border rounded-xl px-3 py-2 mt-1 text-sm"
        value={Number(value ?? 0)}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

function snapTo(v, step) {
  if (!step) return v;
  return Math.round(v / step) * step;
}

function ElementBox({ el, selected, pxPerMm, company, product }) {
  const style = {
    position: "absolute",
    left: el.x * pxPerMm,
    top: el.y * pxPerMm,
    width: el.w * pxPerMm,
    height: el.h * pxPerMm,
    border: selected ? "2px solid #10b981" : "1px solid rgba(15,23,42,0.18)",
    borderRadius: 10,
    overflow: "hidden",
    background: "rgba(255,255,255,0.85)"
  };

  return (
    <div style={style}>
      <ElementRender el={el} company={company} product={product} />
      {selected && (
        <div style={{
          position: "absolute",
          right: 0,
          bottom: 0,
          width: 10,
          height: 10,
          background: "#10b981"
        }} />
      )}
    </div>
  );
}

function resolveFields(str, ctx) {
  const s = String(str ?? "");
  return s
    .replaceAll("{{company.name}}", ctx.company?.name ?? "")
    .replaceAll("{{product.name}}", ctx.product?.name ?? "")
    .replaceAll("{{product.part_number}}", ctx.product?.part_number ?? "")
    .replaceAll("{{product.engine_code}}", ctx.product?.engine_code ?? "")
    .replaceAll("{{product.gearbox_code}}", ctx.product?.gearbox_code ?? "")
    .replaceAll("{{product.location}}", ctx.product?.location ?? "")
    .replaceAll("{{product.id}}", ctx.product?.id ?? "")
    .replaceAll("{{date}}", ctx.date ?? "");
}

function ElementRender({ el, company, product }) {
  const ctx = { company, product, date: new Date().toISOString().slice(0, 10) };

  if (el.type === "text") {
    const text = resolveFields(el.value, ctx);
    const opacity = el.opacity ?? 1;

    return (
      <div style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: el.align === "center" ? "center" : el.align === "right" ? "flex-end" : "flex-start",
        padding: 6,
        fontSize: el.fontSize ?? 9,
        fontWeight: el.fontWeight ?? 700,
        opacity
      }}>
        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{text}</span>
      </div>
    );
  }

  if (el.type === "logo") {
    if (!el.value) return <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">Logo</div>;
    return <img src={el.value} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", padding: 6 }} />;
  }

  if (el.type === "qr") {
    return <QrBox value={resolveFields(el.value, ctx)} />;
  }

  if (el.type === "barcode") {
    return (
      <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">
        Barcode (PDF export)
      </div>
    );
  }

  return null;
}

function QrBox({ value }) {
  const [src, setSrc] = React.useState(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const dataUrl = await QRCode.toDataURL(value || "", { margin: 0, scale: 6 });
      if (mounted) setSrc(dataUrl);
    })();
    return () => { mounted = false; };
  }, [value]);

  if (!src) return <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">QR…</div>;
  return <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />;
}

function QrMini({ company, product }) {
  const sample = product?.id || "sample";
  return (
    <div className="mt-2 border rounded-xl bg-white p-3">
      <div className="text-xs text-slate-500 mb-2">Waarde: {sample}</div>
      <div className="w-28 h-28 border rounded-xl overflow-hidden">
        <QrBox value={sample} />
      </div>
    </div>
  );
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error("Logo upload failed"));
    r.readAsDataURL(file);
  });
}
