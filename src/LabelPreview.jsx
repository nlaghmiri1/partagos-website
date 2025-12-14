import React from "react";
import QRCode from "qrcode";

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

export default function LabelPreview({ company, selectedProduct, template }) {
  const pxPerMm = 6;
  const canvasW = template.width_mm * pxPerMm;
  const canvasH = template.height_mm * pxPerMm;

  const ctx = {
    company,
    product: selectedProduct || {
      id: "demo-123",
      name: "Mechatronic DQ400",
      part_number: "0DD325443A",
      engine_code: "CZEA",
      gearbox_code: "RJW",
      location: "A-12-03"
    },
    date: new Date().toISOString().slice(0, 10)
  };

  return (
    <div className="space-y-3">
      <div className="text-sm text-slate-600">
        Preview met {selectedProduct ? "geselecteerd product" : "demo data"}.
      </div>

      <div className="border rounded-2xl bg-slate-50 p-4 overflow-auto">
        <div
          className="relative border rounded-2xl bg-white overflow-hidden"
          style={{ width: canvasW, height: canvasH }}
        >
          {template.elements.map((el) => (
            <div
              key={el.id}
              style={{
                position: "absolute",
                left: el.x * pxPerMm,
                top: el.y * pxPerMm,
                width: el.w * pxPerMm,
                height: el.h * pxPerMm,
                borderRadius: 10,
                border: "1px solid rgba(15,23,42,0.10)",
                overflow: "hidden",
                background: "rgba(255,255,255,0.90)"
              }}
            >
              <RenderEl el={el} ctx={ctx} />
            </div>
          ))}
        </div>
      </div>

      <div className="text-xs text-slate-500">
        Barcode wordt exact in PDF gerenderd (preview laat placeholder zien).
      </div>
    </div>
  );
}

function RenderEl({ el, ctx }) {
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
    return <Qr value={resolveFields(el.value, ctx)} />;
  }

  if (el.type === "barcode") {
    return <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">Barcode</div>;
  }

  return null;
}

function Qr({ value }) {
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
