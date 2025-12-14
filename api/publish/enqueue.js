import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAdmin = createClient(supabaseUrl, serviceRole);

  const { company_id, marketplace, product_id } = req.body || {};
  if (!company_id || !marketplace || !product_id) {
    return res.status(400).json({ ok: false, error: "company_id, marketplace, product_id required" });
  }

  const { data, error } = await supabaseAdmin
    .from("publish_jobs")
    .insert([{ company_id, marketplace, product_id }])
    .select("*")
    .single();

  if (error) return res.status(500).json({ ok: false, error: error.message });
  return res.status(200).json({ ok: true, job: data });
}
