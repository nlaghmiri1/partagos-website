import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

/**
 * Partagos Dashboard – Supabase connected
 * - Multi-tenant (companies)
 * - Products stored in Supabase
 * - No localStorage
 * - SPA-safe routing
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

  /* ---------------- NAVIGATION (SPA SAFE) ---------------- */

  function goTo(path) {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  /* ---------------- DATA LOADING ---------------- */

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (activeCompanyId) {
      loadProducts(activeCompanyId);
    }
  }, [activeCompanyId]);

  async function loadCompanies() {
    setLoading(true);

    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      alert("Fout bij laden bedrijven: " + error.message);
      return;
    }

    setCompanies(data);

    if (data.length > 0) {
      setActiveCompanyId(data[0].id);
    }

    setLoading(false);
  }

  async function loadProducts(companyId) {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    if (error) {
      alert("Fout bij laden producten: " + error.message);
      return;
    }

    setProducts(data);
  }

  /* ---------------- INSERT PRODUCT ---------------- */

  async function addProduct() {
    if (!form.name || !activeCompanyId) {
      alert("Naam en bedrijf zijn verplicht");
      return;
    }

    const payload = {
      company_id: activeCompanyId,
      name: form.name,
      part_number: form.part_number || null,
      engine_code: form.engine_code || null,
      gearbox_code: form.gearbox_code || null,
      location: form.location || null,
      price: form.price ? Number(form.price) : null,
      stock: Number(form.stock) || 1,
    };

    const { error } = await supabase.from("products").insert([payload]);

    if (error) {
      alert("Fout bij opslaan: " + error.message);
      return;
    }

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

  /* ---------------- UI ---------------- */

  if (loading) {
    return <div style={styles.page}>Laden…</div>;
  }

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <header style={styles.header}>
        <strong>Partagos Dashboard</strong>
        <button onClick={() => goTo("/")} style={styles.link}>
          Uitloggen
        </button>
      </header>

      {/* COMPANY SELECT */}
      <section style={styles.section}>
        <h2>Bedrijf</h2>
        <select
          value={activeCompanyId}
          onChange={(e) => setActiveCompanyId(e.target.value)}
        >
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </section>

      {/* ADD PRODUCT */}
      <section style={styles.section}>
        <h2>Nieuw onderdeel</h2>

        <div style={styles.formGrid}>
          <input
            placeholder="Naam *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            placeholder="Onderdeelnummer"
            value={form.part_number}
            onChange={(e) =>
              setForm({ ...form, part_number: e.target.value })
            }
          />
          <input
            placeholder="Motorcode"
            value={form.engine_code}
            onChange={(e) =>
              setForm({ ...form, engine_code: e.target.value })
            }
          />
          <input
            placeholder="Bakcode"
            value={form.gearbox_code}
            onChange={(e) =>
              setForm({ ...form, gearbox_code: e.target.value })
            }
          />
          <input
            placeholder="Locatie"
            value={form.location}
            onChange={(e) =>
              setForm({ ...form, location: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="Prijs (€)"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
          <input
            type="number"
            placeholder="Voorraad"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
          />
        </div>

        <button onClick={addProduct} style={styles.primaryBtn}>
          Opslaan
        </button>
      </section>

      {/* PRODUCT LIST */}
      <section style={styles.section}>
        <h2>Onderdelen</h2>

        {products.length === 0 ? (
          <p>Geen onderdelen voor dit bedrijf.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Naam</th>
                <th>Onderdeelnr</th>
                <th>Motor</th>
                <th>Bak</th>
                <th>Locatie</th>
                <th>Prijs</th>
                <th>Voorraad</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
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
        )}
      </section>
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const styles = {
  page: {
    padding: 20,
    fontFamily: "Arial, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  link: {
    background: "none",
    border: "none",
    color: "#16a34a",
    cursor: "pointer",
    fontWeight: 600,
  },
  section: {
    marginBottom: 30,
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 8,
    marginBottom: 10,
  },
  primaryBtn: {
    background: "#16a34a",
    color: "#fff",
    border: "none",
    padding: "10px 16px",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 600,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
};
