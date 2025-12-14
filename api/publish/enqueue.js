import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });

  try {
    const { company_id, marketplace, product, images } = req.body || {};

    if (!company_id || !marketplace || !product?.id) {
      return res.status(400).json({ ok: false, error: "Missing fields" });
    }

    const payload = {
      company_id,
      marketplace,
      status: "queued",
      payload: {
        company_id,
        marketplace,
        product,
        images: Array.isArray(images) ? images : []
      }
    };

    const { data, error } = await supabase
      .from("publish_jobs")
      .insert([payload])
      .select("*")
      .single();

    if (error) throw error;

    return res.status(200).json({ ok: true, job: data });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
}
