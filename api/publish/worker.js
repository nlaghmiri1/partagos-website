import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  // Beveilig dit later met een secret header (cron/worker)
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAdmin = createClient(supabaseUrl, serviceRole);

  // 1) haal 1 queued job
  const { data: jobs } = await supabaseAdmin
    .from("publish_jobs")
    .select("*")
    .eq("status", "queued")
    .order("created_at", { ascending: true })
    .limit(1);

  const job = jobs?.[0];
  if (!job) return res.status(200).json({ ok: true, message: "No queued jobs" });

  // 2) mark running
  await supabaseAdmin.from("publish_jobs").update({ status: "running", last_error: null }).eq("id", job.id);

  try {
    // 3) load product
    const { data: product, error: pErr } = await supabaseAdmin
      .from("products")
      .select("*")
      .eq("id", job.product_id)
      .single();

    if (pErr) throw pErr;

    // 4) dispatch connector (stubs)
    let result = null;

    if (job.marketplace === "marktplaats") {
      result = await publishToMarktplaatsStub(product);
    } else if (job.marketplace === "ebay") {
      result = await publishToEbayStub(product);
    } else if (job.marketplace === "rrr") {
      result = await publishToRrrStub(product);
    } else {
      throw new Error("Unknown marketplace");
    }

    await supabaseAdmin
      .from("publish_jobs")
      .update({ status: "done", result_json: result })
      .eq("id", job.id);

    return res.status(200).json({ ok: true, processed: job.id, result });
  } catch (e) {
    await supabaseAdmin
      .from("publish_jobs")
      .update({ status: "failed", last_error: e?.message || String(e) })
      .eq("id", job.id);

    return res.status(200).json({ ok: false, processed: job.id, error: e?.message || String(e) });
  }
}

async function publishToMarktplaatsStub(product) {
  // Hier komt Marktplaats Pro OAuth + Advertisement create/update
  // Docs: api.marktplaats.nl + Pro API/feed uitleg :contentReference[oaicite:3]{index=3}
  return {
    marketplace: "marktplaats",
    action: "stub",
    payload_preview: {
      title: product.name,
      description: `Onderdeelnummer: ${product.part_number}`,
      price: product.price,
    },
  };
}

async function publishToEbayStub(product) {
  // Hier komt eBay OAuth2 + Sell Inventory/Offer publish :contentReference[oaicite:4]{index=4}
  return {
    marketplace: "ebay",
    action: "stub",
    payload_preview: {
      sku: product.part_number || product.id,
      title: product.name,
      price: product.price,
    },
  };
}

async function publishToRrrStub(product) {
  // RRR.lt: partner/API key via hun team (geen publieke volledige docs) :contentReference[oaicite:5]{index=5}
  return {
    marketplace: "rrr",
    action: "stub",
    payload_preview: {
      code: product.part_number,
      title: product.name,
    },
  };
}
