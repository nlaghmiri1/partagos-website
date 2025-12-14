import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";
import { useRole } from "./useRole";
import { featuresForPackage } from "./permissions";

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

  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("products");

  const [companies, setCompanies] = useState([]);
  const [activeCompany, setActiveCompany] = useState(null);

  const [products, setProducts] = useState([]);
  const [searchQ, setSearchQ] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ email: "", role: "viewer" });

  const [productForm, setProductForm] = useState({
    name: "",
    part_number: "",
    engine_code: "",
    gearbox_code: "",
    location: "",
    price: "",
    stock: 1,
  });

  /* ---------------- auth guard ---------------- */

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) goTo("/login");
    });
  }, []);

  /* ---------------- load companies ---------------- */

  useEffect(() => {
    loadCompanies();
  }, []);

  async function loadCompanies() {
    const { data } = await supabase.from("companies").select("*");
    if (data?.length) {
      setCompanies(data);
      setActiveCompany(data[0]);
    }
    setLoading(false);
  }

  /* ---------------- derived: features ---------------- */

  const features = useMemo(
    () => featuresForPackage(activeCompany?.package),
    [activeCompany]
  );

  /* ---------------- load data per company ---------------- */

  useEffect(() => {
    if (!activeCompany) return;
    loadProducts();
    if (features.canUseMultiUsers && role === "admin") {
      loadUsers();
    }
  }, [activeCompany, features, role]);

  async function loadProducts() {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("company_id", activeCompany.id)
      .order("created_at", { ascending: false });
    setProducts(data || []);
  }

  async function loadUsers() {
    const { data } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("company_id", activeCompany.id);
    setUsers(data || []);
  }

  /* ---------------- actions ---------------- */

  async function addProduct() {
    if (!productForm.name) return;

    await supabase.from("products").insert([
      {
        company_id: activeCompany.id,
        ...productForm,
        price: productForm.price ? Number(productForm.price) : null,
        stock: Number(productForm.stock) || 1,
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
      .eq("company_id", activeCompany.id)
      .or(
        `name.ilike.%${q}%,part_number.ilike.%${q}%,engine_code.ilike.%${q}%,gearbox_code.ilike.%${q}%`
      );

    setSearchResults(data || []);
  }

  async function addUser() {
    if (!newUser.email) return;
    if (users.length >= features.maxUsers) {
      alert("Maximaal aantal gebruikers bereikt voor dit pakket.");
      return;
    }

    await supabase.from("user_profiles").insert([
      {
        company_id: activeCompany.id,
        email: newUser.email.trim().toLowerCase(),
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

  /* ---------------- render guards ---------------- */

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Laden…
      </div>
    );
  }

  if (!role) {
    return <div className="p-6">Geen toegang</div>;
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-5 font-bold text-xl border-b border-slate-700">
          Partagos
        </div>

        <nav className="flex-1 p-3 space-y-1 text-sm">
          <NavBtn label="Onderdelen" active={tab === "products"} onClick={() => setTab("products")} />
          <NavBtn label="Zoeken" active={tab === "search"} onClick={() => setTab("search")} />

          {features.canUseLabels && (
            <NavBtn label="Labels" active={tab === "labels"} onClick={() => setTab("labels")} />
          )}

          {features.canUseMultiUsers && role === "admin" && (
            <NavBtn label="Gebruikers" active={tab === "users"} onClick={() => setTab("users")} />
          )}
        </nav>

        <div className="p-4 border-t border-slate-700 text-xs">
          <div>Pakket: <b>{activeCompany.package}</b></div>
          <button
            onClick={logout}
            className="mt-3 w-full bg-slate-800 px-3 py-2 rounded-lg"
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
            value={activeCompany.id}
            onChange={(e) =>
              setActiveCompany(
                companies.find((c) => c.id === e.target.value)
              )
            }
            className="border rounded-lg px-3 py-2 text-sm"
          >
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.package})
              </option>
            ))}
          </select>
        </header>

        <div className="p-6 space-y-6">
          {/* PRODUCTS */}
          {tab === "products" && (
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card title="Nieuw onderdeel">
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
              </Card>

              <Card title="Onderdelen" className="lg:col-span-2">
                <Table
                  headers={["Naam", "Nr", "Motor", "Bak", "Prijs", "Voorraad"]}
                  rows={products.map((p) => [
                    p.name,
                    p.part_number,
                    p.engine_code,
                    p.gearbox_code,
                    p.price ? `€${p.price}` : "-",
                    p.stock,
                  ])}
                />
              </Card>
            </section>
          )}

          {/* SEARCH */}
          {tab === "search" && (
            <Card title="Zoeken">
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

              <Table
                headers={["Naam", "Nr", "Motor", "Bak", "Prijs"]}
                rows={searchResults.map((p) => [
                  p.name,
                  p.part_number,
                  p.engine_code,
                  p.gearbox_code,
                  p.price ? `€${p.price}` : "-",
                ])}
              />
            </Card>
          )}

          {/* LABELS */}
          {tab === "labels" && features.canUseLabels && (
            <Card title="Labels">
              <p className="text-sm text-slate-500">
                Label designer & PDF export (volgende stap).
              </p>
            </Card>
          )}

          {/* USERS */}
          {tab === "users" && features.canUseMultiUsers && role === "admin" && (
            <Card title={`Gebruikers (${users.length}/${features.maxUsers})`}>
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

              <Table
                headers={["Email", "Rol"]}
                rows={users.map((u) => [u.email, u.role])}
              />
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

/* ---------------- UI helpers ---------------- */

function NavBtn({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-2 rounded-lg ${
        active ? "bg-emerald-600" : "hover:bg-slate-800"
      }`}
    >
      {label}
    </button>
  );
}

function Card({ title, children, className = "" }) {
  return (
    <div className={`bg-white p-5 rounded-xl border ${className}`}>
      <h2 className="font-semibold mb-3">{title}</h2>
      {children}
    </div>
  );
}

function Table({ headers, rows }) {
  return (
    <table className="w-full text-sm">
      <thead className="border-b text-left">
        <tr>
          {headers.map((h) => (
            <th key={h}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-b">
            {r.map((c, j) => (
              <td key={j}>{c}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
