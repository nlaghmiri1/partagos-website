import { useMemo, useRef, useState } from "react";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import JsBarcode from "jsbarcode";

/**
 * LabelDesigner (client-side)
 * - Preview (HTML)
 * - Export to PDF via jsPDF
 * - QR via qrcode
 * - Barcode via jsbarcode
 *
 * Props:
 * - company: { id, name, package }
 * - selectedProduct: object (optional)
 */
export default function LabelDesigner({ company, selectedProduct }) {
  const [format, setFormat] = useState("100x50"); // mm
  const [dpi, setDpi] = useState(203); // label printer typical
  const [fields, setFields] = useState({
    title: true,
    partNumber: true,
    engineCode: true,
    gearboxCode: true,
    location: true,
    price: false, // vaak intern; jij bepaalt per klant later
    qr: true,
    barcode: true,
    companyName: true,
  });

  const [data, setData] = useState(() => ({
    name: selectedProduct?.name || "Mechatronic DQ400",
    part_number: selectedProduct?.part_number || "0DD325443A",
    engine_code: selectedProduct?.engine_code || "CHHB",
    gearbox_code: selectedProduct?.gearbox_code || "RJW",
    location: selectedProduct?.location || "Aisle B-12",
    price: selectedProduct?.price || 0,
  }));

  const barcodeSvgRef = useRef(null);

  const size = useMemo(() => {
    const [w, h] = format.split("x").map(Number);
    return { w, h };
  }, [format]);

  const qrText = useMemo(() => {
    // Dit is je “scan payload”. In productie kan dit een publieke URL worden.
    return JSON.stringify({
      tenant: company?.id || null,
      pn: data.part_number,
      ec: data.engine_code,
      gb: data.gearbox_code,
      loc: data.location,
    });
  }, [company, data]);

  async function renderBarcodeToSvg(value) {
    if (!barcodeSvgRef.current) return;
    try {
      JsBarcode(barcodeSvgRef.current, value || "", {
        format: "CODE128",
        displayValue: false,
        margin: 0,
        height: 35,
      });
    } catch {
      // ignore
    }
  }

  async function exportPdf() {
    const { w, h } = size;

    // PDF in mm, label-size exact
    const doc = new jsPDF({
      orientation: w > h ? "landscape" : "portrait",
      unit: "mm",
      format: [w, h],
      compress: true,
    });

    // Layout grid
    const pad = 4;
    let y = pad;

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);

    if (fields.companyName && company?.name) {
      doc.text(company.name, pad, y);
      y += 5;
    }

    if (fields.title) {
      doc.setFontSize(11);
      doc.text(truncate(data.name, 36), pad, y);
      y += 6;
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    const line = (label, value) => {
      if (!value) return;
      doc.text(`${label}: ${String(value)}`, pad, y);
      y += 4.5;
    };

    if (fields.partNumber) line("Part", data.part_number);
    if (fields.engineCode) line("Motor", data.engine_code);
    if (fields.gearboxCode) line("Bak", data.gearbox_code);
    if (fields.location) line("Loc", data.location);
    if (fields.price) line("Prijs", data.price ? `€${data.price}` : "");

    // QR + Barcode area
    const rightColX = w - 38; // reserve
    const qrSize = 26;

    if (fields.qr) {
      const qrDataUrl = await QRCode.toDataURL(qrText, { margin: 0, width: 256 });
      doc.addImage(qrDataUrl, "PNG", rightColX, pad, qrSize, qrSize);
    }

    if (fields.barcode) {
      await renderBarcodeToSvg(data.part_number || "");
      const svg = barcodeSvgRef.current?.outerHTML || "";
      if (svg) {
        const svgDataUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
        // barcode under QR
        const bw = 34;
        const bh = 12;
        doc.addImage(svgDataUrl, "SVG", w - bw - pad, pad + qrSize + 3, bw, bh);
      }
    }

    doc.save(`label-${data.part_number || "part"}.pdf`);
  }

  return (
    <div className="grid lg:grid-cols-[380px_1fr] gap-6">
      {/* Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <h3 className="font-semibold mb-3">Label designer</h3>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Formaat">
            <select
              className="w-full border rounded-xl px-3 py-2"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
            >
              <option value="100x50">100x50 mm</option>
              <option value="102x76">102x76 mm</option>
              <option value="70x40">70x40 mm</option>
            </select>
          </Field>

          <Field label="DPI">
            <select className="w-full border rounded-xl px-3 py-2" value={dpi} onChange={(e) => setDpi(Number(e.target.value))}>
              <option value={203}>203</option>
              <option value={300}>300</option>
            </select>
          </Field>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <Toggle label="Bedrijf" value={fields.companyName} onChange={(v) => setFields({ ...fields, companyName: v })} />
          <Toggle label="Titel" value={fields.title} onChange={(v) => setFields({ ...fields, title: v })} />
          <Toggle label="Part nr" value={fields.partNumber} onChange={(v) => setFields({ ...fields, partNumber: v })} />
          <Toggle label="Motorcode" value={fields.engineCode} onChange={(v) => setFields({ ...fields, engineCode: v })} />
          <Toggle label="Bakcode" value={fields.gearboxCode} onChange={(v) => setFields({ ...fields, gearboxCode: v })} />
          <Toggle label="Locatie" value={fields.location} onChange={(v) => setFields({ ...fields, location: v })} />
          <Toggle label="Prijs" value={fields.price} onChange={(v) => setFields({ ...fields, price: v })} />
          <Toggle label="QR" value={fields.qr} onChange={(v) => setFields({ ...fields, qr: v })} />
          <Toggle label="Barcode" value={fields.barcode} onChange={(v) => setFields({ ...fields, barcode: v })} />
        </div>

        <div className="mt-5 space-y-2">
          <Input label="Naam" value={data.name} onChange={(v) => setData({ ...data, name: v })} />
          <Input label="Part number" value={data.part_number} onChange={(v) => setData({ ...data, part_number: v })} />
          <Input label="Motorcode" value={data.engine_code} onChange={(v) => setData({ ...data, engine_code: v })} />
          <Input label="Bakcode" value={data.gearbox_code} onChange={(v) => setData({ ...data, gearbox_code: v })} />
          <Input label="Locatie" value={data.location} onChange={(v) => setData({ ...data, location: v })} />
          <Input label="Prijs" value={String(data.price ?? "")} onChange={(v) => setData({ ...data, price: Number(v || 0) })} />
        </div>

        <button
          type="button"
          onClick={exportPdf}
          className="mt-5 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-xl"
        >
          Exporteer PDF (QR + barcode)
        </button>

        {/* hidden svg for barcode rendering */}
        <svg ref={barcodeSvgRef} style={{ position: "absolute", left: -9999, top: -9999 }} />
      </div>

      {/* Preview */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <h3 className="font-semibold mb-3">Preview</h3>

        <div className="text-xs text-slate-500 mb-3">
          Formaat: {size.w}×{size.h} mm • DPI: {dpi}
        </div>

        <div
          className="border rounded-xl bg-white p-4"
          style={{
            width: "100%",
            maxWidth: 640,
            aspectRatio: `${size.w} / ${size.h}`,
          }}
        >
          {fields.companyName && company?.name && (
            <div className="text-[12px] font-bold">{company.name}</div>
          )}

          {fields.title && <div className="text-[14px] font-extrabold mt-1">{data.name}</div>}

          <div className="text-[12px] mt-2 space-y-1">
            {fields.partNumber && <div><b>Part:</b> {data.part_number}</div>}
            {fields.engineCode && <div><b>Motor:</b> {data.engine_code}</div>}
            {fields.gearboxCode && <div><b>Bak:</b> {data.gearbox_code}</div>}
            {fields.location && <div><b>Loc:</b> {data.location}</div>}
            {fields.price && <div><b>Prijs:</b> €{data.price}</div>}
          </div>

          <div className="mt-3 flex items-start justify-between gap-3">
            <div className="text-[10px] text-slate-500">
              Scan payload:
              <pre className="whitespace-pre-wrap break-words">{qrText}</pre>
            </div>
            <div className="flex flex-col items-end gap-2">
              {fields.qr && <QRPreview text={qrText} />}
              {fields.barcode && <BarcodePreview value={data.part_number} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- small components ---------------- */

function Field({ label, children }) {
  return (
    <label className="block">
      <div className="text-xs text-slate-600 mb-1">{label}</div>
      {children}
    </label>
  );
}

function Toggle({ label, value, onChange }) {
  return (
    <label className="flex items-center gap-2 border rounded-xl px-3 py-2 cursor-pointer">
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

function Input({ label, value, onChange }) {
  return (
    <label className="block">
      <div className="text-xs text-slate-600 mb-1">{label}</div>
      <input
        className="w-full border rounded-xl px-3 py-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function truncate(s, n) {
  const str = String(s || "");
  return str.length > n ? str.slice(0, n - 1) + "…" : str;
}

function QRPreview({ text }) {
  const [dataUrl, setDataUrl] = useState("");
  useMemo(() => {
    QRCode.toDataURL(text, { margin: 0, width: 140 }).then(setDataUrl).catch(() => setDataUrl(""));
  }, [text]);
  if (!dataUrl) return null;
  return <img alt="QR" src={dataUrl} className="w-[90px] h-[90px] border rounded-md" />;
}

function BarcodePreview({ value }) {
  const svgRef = useRef(null);
  useEffect(() => {
    if (!svgRef.current) return;
    try {
      JsBarcode(svgRef.current, value || "", { format: "CODE128", displayValue: false, height: 35, margin: 0 });
    } catch {
      // ignore
    }
  }, [value]);
  return (
    <div className="border rounded-md p-1">
      <svg ref={svgRef} />
    </div>
  );
}
