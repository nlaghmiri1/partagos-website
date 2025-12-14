import { createClient } from "@supabase/supabase-js";

function badRequest(res, msg) {
  return res.status(400).json({ ok: false, error: msg });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRole) {
    return res.status(500).json({ ok: false, error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" });
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRole);

  const { companyName, email, packageName = "starter", role = "admin", redirectTo } = req.body || {};

  if (!companyName || typeof companyName !== "string") return badRequest(res, "companyName is required");
  if (!email || typeof email !== "string") return badRequest(res, "email is required");
  if (!["starter", "growth", "scale"].includes(packageName)) return badRequest(res, "Invalid packageName");
  if (!["admin", "warehouse", "sales", "viewer"].includes(role)) return badRequest(res, "Invalid role");

  const normalizedEmail = email.trim().toLowerCase();
  const safeRedirectTo = typeof redirectTo === "string" && redirectTo.startsWith("https://")
    ? redirectTo
    : "https://partagos.nl/dashboard";

  try {
    // 1) Create company
    const { data: company, error: companyErr } = await supabaseAdmin
      .from("companies")
      .insert([{ name: companyName.trim(), package: packageName }])
      .select("*")
      .single();

    if (companyErr) throw companyErr;

    // 2) Create user_profile (data layer)
    const { error: profileErr } = await supabaseAdmin
      .from("user_profiles")
      .insert([{
        company_id: company.id,
        email: normalizedEmail,
        full_name: null,
        role,
      }]);

    if (profileErr) throw profileErr;

    // 3) Invite user (auth layer)
    const { data: invite, error: inviteErr } = await supabaseAdmin.auth.admin.inviteUserByEmail(normalizedEmail, {
      redirectTo: safeRedirectTo,
    });

    if (inviteErr) throw inviteErr;

    return res.status(200).json({
      ok: true,
      company,
      invited_email: normalizedEmail,
      redirectTo: safeRedirectTo,
      invite_user_id: invite?.user?.id || null,
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
}
