import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });

  const supabase = getSupabaseAdmin();

  const { company_name, package: pkg, admin_email } = req.body || {};
  if (!company_name || !admin_email) {
    return res.status(400).json({ ok: false, error: "company_name and admin_email required" });
  }

  const packageValue = (pkg || "starter").toLowerCase();
  if (!["starter", "growth", "scale"].includes(packageValue)) {
    return res.status(400).json({ ok: false, error: "invalid package" });
  }

  try {
    // 1) Create company
    const { data: company, error: cErr } = await supabase
      .from("companies")
      .insert([{ name: company_name, package: packageValue }])
      .select("*")
      .single();
    if (cErr) throw cErr;

    // 2) Invite user by email (Supabase Auth)
    const { data: invited, error: iErr } = await supabase.auth.admin.inviteUserByEmail(admin_email, {
      redirectTo: "https://partagos.nl"
    });
    if (iErr) throw iErr;

    // 3) Insert user profile mapping (admin for that company)
    const { error: pErr } = await supabase.from("user_profiles").insert([{
      email: admin_email,
      company_id: company.id,
      role: "admin"
    }]);
    if (pErr) throw pErr;

    return res.status(200).json({
      ok: true,
      company,
      invited_user: invited?.user || null
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
}
