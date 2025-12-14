import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function csvEscape(v) {
  const s = String(v ?? "");
  if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export default async function handler(req, res) {
  try {
    const company_id = req.query.company_id;
    if (!company_id) return res.status(400).send("company_id required");

    const { data: products, error } = await supabase
      .from("products")
      .select("id,name,part_number,engine_code,gearbox_code,price,stock,slug,is_public")
      .eq("company_id", company_id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Fetch main image per product (position 0)
    const rows = [];
    for (const p of products || []) {
      const { data: img } = await supabase
        .from("product_images")
        .select("public_url,position")
        .eq("company_id", company_id)
        .eq("product_id", p.id)
        .order("position", { ascending: true })
        .limit(1);

      const main = img?.[0]?.public_url || "";
      const publicLink = p.slug ? `${req.headers["x-forwarded-proto"] || "https"}://${req.headers.host}/p/${p.slug}` : "";

      rows.push([
        p.id,
        p.name,
        p.part_number,
        p.engine_code,
        p.gearbox_code,
        p.price,
        p.stock,
        main,
        publicLink,
        p.is_public
      ]);
    }

    const header = ["id","name","part_number","engine_code","gearbox_code","price","stock","main_image","public_link","is_public"];
    const csv = [
      header.join(","),
      ...rows.map((r) => r.map(csvEscape).join(","))
    ].join("\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=partagos-products.csv");
    return res.status(200).send(csv);
  } catch (e) {
    return res.status(500).send(e?.message || String(e));
  }
}
