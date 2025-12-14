import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  const { company_id, voertuig } = req.body || {};
  if (!company_id || !voertuig) return res.status(400).json({ ok: false, error: "company_id + voertuig required" });

  try {
    const row = {
      company_id,
      license_plate: voertuig.kenteken || null,
      make: voertuig.merk || null,
      model: voertuig.handelsbenaming || null,
      variant: voertuig.inrichting || null,
      first_registration_date: voertuig.datum_eerste_toelating ? voertuig.datum_eerste_toelating.slice(0, 10) : null,
      engine_code: voertuig.motorcode || null,
      gearbox_code: voertuig.versnellingsbakcode || null,
      fuel_type: voertuig.brandstof_omschrijving || null,
      power_kw: voertuig.maximum_vermogen ? Number(voertuig.maximum_vermogen) : null,
      raw_json: voertuig
    };

    const { data, error } = await supabase.from("vehicles").insert([row]).select("*").single();
    if (error) throw error;

    return res.status(200).json({ ok: true, vehicle: data });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
}
