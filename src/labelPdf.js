import jsPDF from "jspdf";
import QRCode from "qrcode";
import JsBarcode from "jsbarcode";

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

function mmToPx(mm, dpi) {
  return Math.round((mm * dpi) / 25.4);
}

function pxToMm(px, dpi) {
  return (px * 25.4) / dpi;
}

async function drawQr(ctx2d, value, xPx, yPx, wPx, hPx) {
  const dataUrl = await QRCode.toDataURL(value || "", { margin: 0, scale: 8 });
  const img = await loadImage(dataUrl);
  ctx2d.drawImage(img, xPx, yPx, wPx, hPx);
}

async function drawBarcode(ctx2d, value, xPx, yPx, wPx, hPx, text = false) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.floor(wPx));
  canvas.height = Math.max(1, Math.floor(hPx));
  JsBarcode(canvas, value || "", {
    format: "CODE128",
    displayValue: !!text,
    margin: 0,
    width: 2,
    height: canvas.height - (text ? 18 : 0)
  });
  ctx2d.drawImage(canvas, xPx, yPx, wPx, hPx);
}

function drawText(ctx2d, el, value, xPx, yPx, wPx, hPx) {
  const fontSize = el.fontSize ?? 9;
  const fontWeight = el.fontWeight ?? 700;
  const opacity = el.opacity ?? 1;

  ctx2d.save();
  ctx2d.globalAlpha = opacity;
  ctx2d.fillStyle = "#000";
  ctx2d.font = `${fontWeight} ${fontSize * 3}px Arial`; // scaled, canvas is high DPI
  ctx2d.textBaseline = "middle";

  let tx = xPx + 10;
  if (el.align === "center") tx = xPx + wPx / 2;
  if (el.align === "right") tx = xPx + wPx - 10;

  const ty = yPx + hPx / 2;

  ctx2d.textAlign = el.align === "center" ? "center" : el.align === "right" ? "right" : "left";
  ctx2d.fillText(value, tx, ty, wPx - 20);
  ctx2d.restore();
}

async function drawLogo(ctx2d, dataUrl, xPx, yPx, wPx, hPx) {
  if (!dataUrl) return;
  const img = await loadImage(dataUrl);
  // contain
  const ratio = Math.min(wPx / img.width, hPx / img.height);
  const dw = img.width * ratio;
  const dh = img.height * ratio;
  const dx = xPx + (wPx - dw) / 2;
  const dy = yPx + (hPx - dh) / 2;
  ctx2d.drawImage(img, dx, dy, dw, dh);
}

async function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = src;
  });
}

/**
 * Export 1 label to print-ready PDF with exact mm dimensions.
 */
export async function exportLabelToPdf({ template, context, fileName = "label.pdf" }) {
  const dpi = 300; // print quality
  const wPx = mmToPx(template.width_mm, dpi);
  const hPx = mmToPx(template.height_mm, dpi);

  const canvas = document.createElement("canvas");
  canvas.width = wPx;
  canvas.height = hPx;

  const ctx2d = canvas.getContext("2d");
  // white background
  ctx2d.fillStyle = "#fff";
  ctx2d.fillRect(0, 0, wPx, hPx);

  // render elements in order (layers)
  for (const el of template.elements) {
    const xPx = mmToPx(el.x, dpi);
    const yPx = mmToPx(el.y, dpi);
    const ewPx = mmToPx(el.w, dpi);
    const ehPx = mmToPx(el.h, dpi);

    if (el.type === "text") {
      const value = resolveFields(el.value, context);
      drawText(ctx2d, el, value, xPx, yPx, ewPx, ehPx);
    }

    if (el.type === "qr") {
      const value = resolveFields(el.value, context);
      await drawQr(ctx2d, value, xPx, yPx, ewPx, ehPx);
    }

    if (el.type === "barcode") {
      const value = resolveFields(el.value, context);
      await drawBarcode(ctx2d, value, xPx, yPx, ewPx, ehPx, !!el.text);
    }

    if (el.type === "logo") {
      await drawLogo(ctx2d, el.value, xPx, yPx, ewPx, ehPx);
    }
  }

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF({
    orientation: template.width_mm >= template.height_mm ? "landscape" : "portrait",
    unit: "mm",
    format: [template.width_mm, template.height_mm]
  });

  pdf.addImage(imgData, "PNG", 0, 0, template.width_mm, template.height_mm, undefined, "FAST");
  pdf.save(fileName);
}
