import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

/**
 * Partagos – Professional SaaS Dashboard
 * - Supabase connected
 * - Multi-tenant ready
 * - Styled with TailwindCSS
 */

export default function Dashboard() {
  const [companies, setCompanies] = useState([]);
  const [activeCompanyId, setActiveCompanyId] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    part_number: "",
    engine_code: "",
    gearbox_code: "",
    location: "",
    price: "",
    stock: 1,
  });

  /* ---------------- DATA ---------------- */

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (activeCompanyId) loadProducts(activeCompanyId);
  }, [activeCompanyId]);

  async function loadCompanies() {
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .order("created_at", { ascending: true });

    if (!error && data.length) {
      setCompanies(data);
      setActiveCompanyId(data[0].id);
    }
    setLoading(false);
  }

  async function loadProducts(companyId) {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    setProducts(data || []);
  }

  async function addProduct() {
    if (!form.name) return;

    await supabase.from("products").insert([
      {
        company_id: activeCompanyId,
        name: form.name,
        part_number: form.part_number,
        engine_code: form.engine_code,
        gearbox_code: form.gearbox_code,
        location: form.location,
        price: form.price ? Number(form.price) : null,
        stock: Number(form.stock) || 1,
      },
    ]);

    setForm({
      name: "",
      part_number: "",
      engine_code: "",
      gearbox_code: "",
      location: "",
      price: "",
      stock: 1,
    });

    loadProducts(activeCompanyId);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Laden…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="px-6 py-5 text-xl font-bold border-b border-slate-700">
          Partagos
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2 text-sm">
          <div className="opacity-70">Dashboard</div>
          <div className="opacity-70">Onderdelen</div>
          <div className="opacity-70">Magazijn</div>
          <div className="opacity-70">Labels</div>
          <div className="opacity-70">Kanalen</div>
        </nav>

        <div className="px-4 py-4 border-t border-slate-700 text-xs opacity-60">
          SaaS demo omgeving
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1">
        {/* TOPBAR */}
        <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold">Dashboard</h1>
            <p className="text-sm text-gray-500">
              Beheer onderdelen en voorraad
            </p>
          </div>

          <select
            value={activeCompanyId}
            onChange={(e) => setActiveCompanyId(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
          >
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </header>

        {/* CONTENT */}
        <div className="p-6 space-y-8">
          {/* ADD PRODUCT */}
          <section className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">
              Nieuw onderdeel toevoegen
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <input
                placeholder="Naam"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                className="border rounded px-3 py-2"
              />
              <input
                placeholder="Onderdeelnummer"
                value={form.part_number}
                onChange={(e) =>
                  setForm({ ...form, part_number: e.target.value })
                }
                className="border rounded px-3 py-2"
              />
              <input
                placeholder="Motorcode"
                value={form.engine_code}
                onChange={(e) =>
                  setForm({ ...form, engine_code: e.target.value })
                }
                className="border rounded px-3 py-2"
              />
              <input
                placeholder="Bakcode"
                value={form.gearbox_code}
                onChange={(e) =>
                  setForm({ ...form, gearbox_code: e.target.value })
                }
                className="border rounded px-3 py-2"
              />
              <input
                placeholder="Locatie"
                value={form.location}
                onChange={(e) =>
                  setForm({ ...form, location: e.target.value })
                }
                className="border rounded px-3 py-2"
              />
              <input
                type="number"
                placeholder="Prijs"
                value={form.price}
                onChange={(e) =>
                  setForm({ ...form, price: e.target.value })
                }
                className="border rounded px-3 py-2"
              />
              <input
                type="number"
                placeholder="Voorraad"
                value={form.stock}
                onChange={(e) =>
                  setForm({ ...form, stock: e.target.value })
                }
                className="border rounded px-3 py-2"
              />
            </div>

            <button
              onClick={addProduct}
              className="bg-emerald-600 text-white px-5 py-2 rounded-md font-medium"
            >
              Opslaan
            </button>
          </section>

          {/* PRODUCTS TABLE */}
          <section className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Onderdelen</h2>

            {products.length === 0 ? (
              <p className="text-gray-500 text-sm">
                Geen onderdelen gevonden.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-gray-500 border-b">
                    <tr>
                      <th className="py-2">Naam</th>
                      <th>Nr</th>
                      <th>Motor</th>
                      <th>Bak</th>
                      <th>Locatie</th>
                      <th>Prijs</th>
                      <th>Voorraad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr
                        key={p.id}
                        className="border-b last:border-0"
                      >
                        <td className="py-2 font-medium">{p.name}</td>
                        <td>{p.part_number}</td>
                        <td>{p.engine_code}</td>
                        <td>{p.gearbox_code}</td>
                        <td>{p.location}</td>
                        <td>{p.price ? `€${p.price}` : "-"}</td>
                        <td>{p.stock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
