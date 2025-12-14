export default async function handler(req, res) {
  const kenteken = String(req.query.kenteken || "").replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  if (!kenteken) return res.status(400).json({ ok: false, error: "kenteken required" });

  // RDW Open Data: m9d7-ebf2 (Gekentekende voertuigen) :contentReference[oaicite:7]{index=7}
  const url = `https://opendata.rdw.nl/resource/m9d7-ebf2.json?kenteken=${encodeURIComponent(kenteken)}`;

  try {
    const r = await fetch(url);
    const data = await r.json();
    const row = data?.[0] || null;
    return res.status(200).json({ ok: true, kenteken, vehicle: row });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
}
