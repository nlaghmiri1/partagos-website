import React, { useMemo, useState } from "react";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import JsBarcode from "jsbarcode";

export default function LabelDesigner({ company, selectedProduct }) {
  const [size, setSize] = useState("80x40"); // mm
  const [showPrice, setShowPrice] = useState(true);

  const product = selectedProduct || null;

  const labelData = useMemo(() => {
    const p = product || {};
    return {
      company: company?.name || "Company",
      name: p.name || "Onderdeel",
      part_number: p.part_number || "—",
      engine_code: p.engine_code || "—",
      gearbox_code: p.gearbox_code || "—",
      location: p.location || "—",
      price: p.price ? `€${p.price}` : "—",
      stock: p.stock ?? "—",
      id: p.id || "demo"
    };
  }, [company, product]);

  async function exportPdf() {
    const [wmm, hmm] = size.split("x").map((n) => Number(n));
    const doc = new jsPDF({ unit: "mm", format: [wmm, hmm] });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(labelData.company, 4, 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(labelData.name, 4, 12);

    doc.setFontSize(7);
    doc.text(`Nr: ${labelData.part_number}`, 4, 16);
    doc.text(`Motor: ${labelData.engine_code}`, 4, 19);
    doc.text(`Bak: ${labelData.gearbox_code}`, 4, 22);
    doc.text(`Loc: ${labelData.location}`, 4, 25);
    doc.text(`Voorraad: ${labelData.stock}`, 4, 28);

    if (showPrice) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(`${labelData.price}`, 4, hmm - 4);
    }

    // QR (encode minimal payload)
    const qrPayload = JSON.stringify({
      id: labelData.id,
      part_number: labelData.part_number,
      company: labelData.company
    });

    const qrDataUrl = await QRCode.toDataURL(qrPayload, { margin: 0, width: 128 });
    doc.addImage(qrDataUrl, "PNG", wmm - 22, 4, 18, 18);

    // Barcode (part_number)
    const canvas = document.createElement("canvas");
    JsBarcode(canvas, String(labelData.part_number || "000000"), { displayValue: false, height: 30, margin: 0 });
    const barcode = canvas.toDataURL("image/png");
    doc.addImage(barcode, "PNG", 4, hmm - 16, wmm - 30, 10);

    doc.save(`label-${labelData.part_number}.pdf`);
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-slate-600">
        Selecteer een product in “Onderdelen” om labeldata te vullen. (Nu: {product ? "geselecteerd" : "demo"})
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <div className="bg-slate-50 border rounded-xl p-4">
          <div className="text-sm font-semibold">Instellingen</div>

          <div className="mt-3">
            <label className="text-sm">Formaat</label>
            <select className="w-full border rounded-xl px-3 py-2 mt-1" value={size} onChange={(e) => setSize(e.target.value)}>
              <option value="80x40">80x40 mm</option>
              <option value="100x50">100x50 mm</option>
              <option value="70x30">70x30 mm</option>
            </select>
          </div>

          <label className="mt-3 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={showPrice} onChange={(e) => setShowPrice(e.target.checked)} />
            Prijs op label
          </label>

          <button onClick={exportPdf} className="mt-4 w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-xl font-semibold">
            Export PDF
          </button>
        </div>

        <div className="md:col-span-2 bg-white border rounded-xl p-4">
          <div className="text-sm font-semibold mb-2">Preview (data)</div>
          <pre className="text-xs bg-slate-50 border rounded-xl p-3 overflow-auto">
            {JSON.stringify(labelData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
