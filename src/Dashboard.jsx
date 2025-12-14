import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";
import { useRole } from "./useRole";

/* ---------------- helpers ---------------- */

function goTo(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function escapeIlike(s) {
  return s.replaceAll("%", "\\%").replaceAll("_", "\\_");
}

/* ---------------- component ---------------- */

export default function Dashboard() {
  const { role, loading: roleLoading } = useRole();

  const [tab, setTab] = useState("products");
  const [loading, setLoading] = useState(true);

  const [companies, setCompanies] = useState([]);
  const [activeCompanyId, setActiveCompanyId] = useState("");

  const [products, setProducts] = useState([]);
  const [searchQ, setSearchQ] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const [productForm, setProductForm] = useState({
    name: "",
    part_number: "",
    engine_code: "",
    gearbox_code: "",
    location: "",
    price: "",
    stock: 1,
  });

  const [labelProfiles, setLabelProfiles] = useState([]);
  const [activeLabel, setActiveLabel] = useState(null);

  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    email: "",
    role: "viewer",
  });

  /* ---------------- auth guard ---------------- */

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) goTo("/login");
    });
  }, []);

  /* ---------------- load data ---------------- */

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (activeCompanyId) {
      loadProducts();
      loadLabels();
      loadUsers();
    }
  }, [activeCompanyId]);

  async function loadCompanies() {
    const { data } = await supabase.from("companies").select("*");
    setCompanies(data || []);
    if (data?.length) setActiveCompanyId(data[0].id);
    setLoading(false);
  }

  async function loadProducts() {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("company_id", activeCompanyId)
      .order("created_at", { ascending: false });
    setProducts(data || []);
  }

  async function loadLabels() {
    const { data } = await supabase
      .from("label_profiles")
      .select("*")
      .eq("company_id", activeCompanyId);
    setLabelProfiles(data || []);
    if (data?.length) setActiveLabel(data[0]);
  }

  async function loadUsers() {
    const { data } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("company_id", activeCompanyId);
    setUsers(data || []);
  }

  /* ---------------- actions ---------------- */

  async function addProduct() {
    if (!productForm.name) return;

    await supabase.from("products").insert([
      {
        company_id: activeCompanyId,
        ...productForm,
        price: productForm.price ? Number(productForm.price) : null,
        stock: Number(productForm.stock),
      },
    ]);

    setProductForm({
      name: "",
      part_number: "",
      engine_code: "",
      gearbox_code: "",
      location: "",
      price: "",
      stock: 1,
    });

    loadProducts();
  }

  async function runSearch() {
    const q = escapeIlike(searchQ.trim());
    if (!q) return;

    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("company_id", activeCompanyId)
      .or(
        `name.ilike.%${q}%,part_number.ilike.%${q}%,engine_code.ilike.%${q}%,gearbox_code.ilike.%${q}%`
      );

    setSearchResults(data || []);
  }

  async function addUser() {
    if (!newUser.email) return;

    await supabase.from("user_profiles").insert([
      {
        company_id: activeCompanyId,
        email: newUser.email,
        role: newUser.role,
      },
    ]);

    setNewUser({ email: "", role: "viewer" });
    loadUsers();
  }

  async function logout() {
    await supabase.auth.signOut();
    goTo("/login");
  }

  /* ---------------- render ---------------- */

  if (loading || roleLoading) {
    return <div className="min-h-screen flex items-center justify-center">Laden…</div>;
  }

  if (!role) {
    return <div className="p-6">Geen toegang</div>;
  }

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-5 font-bold text-xl border-b border-slate-700">
          Partagos
        </div>

        <nav className="flex-1 p-3 space-y-1 text-sm">
          {[
            ["products", "Onderdelen"],
            ["search", "Zoeken"],
            ["labels", "Labels"],
            ["roles", "Rollen"],
          ].map(([k, l]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`w-full text-left px-4 py-2 rounded-lg ${
                tab === k ? "bg-emerald-600" : "hover:bg-slate-800"
              }`}
            >
              {l}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <button
            onClick={logout}
            className="w-full text-sm bg-slate-800 px-3 py-2 rounded-lg"
          >
            Uitloggen
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1">
        <header className="bg-white border-b p-4 flex justify-between items-center">
          <h1 className="font-semibold capitalize">{tab}</h1>

          <select
            value={activeCompanyId}
            onChange={(e) => setActiveCompanyId(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </header>

        <div className="p-6 space-y-6">
          {/* PRODUCTS */}
          {tab === "products" && (
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white p-5 rounded-xl border">
                <h2 className="font-semibold mb-3">Nieuw onderdeel</h2>

                {Object.entries(productForm).map(([k, v]) => (
                  <input
                    key={k}
                    placeholder={k}
                    value={v}
                    type={k === "price" || k === "stock" ? "number" : "text"}
                    onChange={(e) =>
                      setProductForm({ ...productForm, [k]: e.target.value })
                    }
                    className="w-full mb-2 border rounded-lg px-3 py-2"
                  />
                ))}

                <button
                  onClick={addProduct}
                  className="mt-2 bg-emerald-600 text-white w-full py-2 rounded-lg"
                >
                  Opslaan
                </button>
              </div>

              <div className="lg:col-span-2 bg-white p-5 rounded-xl border">
                <h2 className="font-semibold mb-3">Onderdelen</h2>

                <table className="w-full text-sm">
                  <thead className="border-b text-left">
                    <tr>
                      <th>Naam</th>
                      <th>Nr</th>
                      <th>Motor</th>
                      <th>Bak</th>
                      <th>Prijs</th>
                      <th>Voorraad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id} className="border-b">
                        <td>{p.name}</td>
                        <td>{p.part_number}</td>
                        <td>{p.engine_code}</td>
                        <td>{p.gearbox_code}</td>
                        <td>{p.price ? `€${p.price}` : "-"}</td>
                        <td>{p.stock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* SEARCH */}
          {tab === "search" && (
            <section className="bg-white p-5 rounded-xl border">
              <div className="flex gap-2 mb-4">
                <input
                  className="flex-1 border rounded-lg px-4 py-2"
                  placeholder="Zoek op nr, motor, bak…"
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                />
                <button
                  onClick={runSearch}
                  className="bg-emerald-600 text-white px-4 rounded-lg"
                >
                  Zoek
                </button>
              </div>

              <table className="w-full text-sm">
                <thead className="border-b text-left">
                  <tr>
                    <th>Naam</th>
                    <th>Nr</th>
                    <th>Motor</th>
                    <th>Bak</th>
                    <th>Prijs</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map((p) => (
                    <tr key={p.id} className="border-b">
                      <td>{p.name}</td>
                      <td>{p.part_number}</td>
                      <td>{p.engine_code}</td>
                      <td>{p.gearbox_code}</td>
                      <td>{p.price ? `€${p.price}` : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {/* LABELS */}
          {tab === "labels" && (
            <section className="bg-white p-5 rounded-xl border">
              <h2 className="font-semibold mb-3">Labelprofielen</h2>
              {labelProfiles.map((l) => (
                <div
                  key={l.id}
                  className="border rounded-lg p-3 mb-2"
                >
                  <div className="font-medium">{l.name}</div>
                  <div className="text-sm text-slate-500">
                    Formaat: {l.size}
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* ROLES */}
          {tab === "roles" && role === "admin" && (
            <section className="bg-white p-5 rounded-xl border">
              <h2 className="font-semibold mb-3">Gebruikers</h2>

              <div className="flex gap-2 mb-4">
                <input
                  className="border rounded-lg px-3 py-2"
                  placeholder="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                />
                <select
                  className="border rounded-lg px-3 py-2"
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value })
                  }
                >
                  {["admin", "warehouse", "sales", "viewer"].map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
                <button
                  onClick={addUser}
                  className="bg-emerald-600 text-white px-3 rounded-lg"
                >
                  Toevoegen
                </button>
              </div>

              <table className="w-full text-sm">
                <thead className="border-b text-left">
                  <tr>
                    <th>Email</th>
                    <th>Rol</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b">
                      <td>{u.email}</td>
                      <td>{u.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
