export default async function handler(req, res) {
  const kenteken = String(req.query.kenteken || "")
    .replace(/[^A-Za-z0-9]/g, "")
    .toUpperCase();

  if (!kenteken) {
    return res.status(400).json({ ok: false, error: "kenteken required" });
  }

  try {
    const r = await fetch(
      `https://opendata.rdw.nl/resource/m9d7-ebf2.json?kenteken=${kenteken}`
    );
    const data = await r.json();

    return res.status(200).json({
      ok: true,
      kenteken,
      voertuig: data?.[0] || null
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}
