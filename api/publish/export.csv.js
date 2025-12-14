import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  const company_id = String(req.query.company_id || "");
  if (!company_id) return res.status(400).send("company_id required");

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .eq("company_id", company_id)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).send(error.message);

  const rows = (products || []).map((p) => ({
    id: p.id,
    name: p.name || "",
    part_number: p.part_number || "",
    engine_code: p.engine_code || "",
    gearbox_code: p.gearbox_code || "",
    location: p.location || "",
    price: p.price ?? "",
    stock: p.stock ?? ""
  }));

  const header = Object.keys(rows[0] || { id: "" }).join(",");
  const body = rows.map((r) => Object.values(r).map(csv).join(",")).join("\n");
  const csvOut = header + "\n" + body;

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="partagos-products-${company_id}.csv"`);
  return res.status(200).send(csvOut);
}

function csv(v) {
  const s = String(v ?? "");
  if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replaceAll('"', '""')}"`;
  return s;
}
