import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  try {
    // pak 1 queued job
    const { data: jobs, error } = await supabase
      .from("publish_jobs")
      .select("*")
      .eq("status", "queued")
      .order("created_at", { ascending: true })
      .limit(1);

    if (error) throw error;

    const job = jobs?.[0];
    if (!job) return res.status(200).json({ ok: true, message: "No queued jobs" });

    // Simuleer publish verwerking
    // Later: hier voeg je echte API calls toe (OAuth/keys per marketplace)
    const payload = job.payload || {};
    const images = payload.images || [];

    // Marktplaats/eBay/RRR stubs
    const result = {
      published: true,
      marketplace: job.marketplace,
      product_id: payload.product?.id,
      images_sent: images.length
    };

    const { error: updErr } = await supabase
      .from("publish_jobs")
      .update({ status: "done", result })
      .eq("id", job.id);

    if (updErr) throw updErr;

    return res.status(200).json({ ok: true, job_id: job.id, result });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
}
