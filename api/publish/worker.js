import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data: jobs } = await supabase
    .from("publish_jobs")
    .select("*")
    .eq("status", "queued")
    .order("created_at", { ascending: true })
    .limit(1);

  const job = jobs?.[0];
  if (!job) return res.status(200).json({ ok: true, message: "No queued jobs" });

  await supabase.from("publish_jobs").update({ status: "running", last_error: null }).eq("id", job.id);

  try {
    const { data: product, error: pErr } = await supabase
      .from("products")
      .select("*")
      .eq("id", job.product_id)
      .single();
    if (pErr) throw pErr;

    const result = {
      marketplace: job.marketplace,
      published: false,
      reason: "Connector keys not configured yet",
      payload_preview: {
        title: product.name,
        part_number: product.part_number,
        price: product.price,
        stock: product.stock
      }
    };

    await supabase.from("publish_jobs").update({ status: "done", result_json: result }).eq("id", job.id);
    return res.status(200).json({ ok: true, processed: job.id, result });
  } catch (e) {
    await supabase.from("publish_jobs").update({ status: "failed", last_error: e?.message || String(e) }).eq("id", job.id);
    return res.status(200).json({ ok: false, processed: job.id, error: e?.message || String(e) });
  }
}
