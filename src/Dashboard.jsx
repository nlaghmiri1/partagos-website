import React, { useState } from "react";

export default function Dashboard() {
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Versnellingsbak DQ400",
      code: "RJW",
      location: "Magazijn A / Rek 3 / Vak B",
      price: 349,
      stock: 1,
      channels: {
        partagos: true,
        marktplaats: true,
        ebay: false,
        rrr: true,
      },
    },
  ]);

  const [form, setForm] = useState({
    name: "",
    code: "",
    location: "Magazijn A / Rek 1 / Vak A",
    price: "",
    stock: 1,
  });

  const addProduct = () => {
    if (!form.name || !form.code) return;

    setProducts([
      ...products,
      {
        ...form,
        id: Date.now(),
        price: Number(form.price),
        stock: Number(form.stock),
        channels: {
          partagos: true,
          marktplaats: false,
          ebay: false,
          rrr: false,
        },
      },
    ]);

    setForm({
      name: "",
      code: "",
      location: "Magazijn A / Rek 1 / Vak A",
      price: "",
      stock: 1,
    });
  };

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <header style={styles.header}>
        <strong>Partagos Dashboard</strong>
        <span style={styles.user}>Demo account – Admin</span>
      </header>

      {/* KPI */}
      <section style={styles.kpis}>
        <KPI label="Onderdelen" value={products.length} />
        <KPI label="Magazijnen" value="2" />
        <KPI label="Actieve advertenties" value={products.filter(p =>
          Object.values(p.channels).some(v => v)
        ).length} />
        <KPI label="Kanalen" value="4" />
      </section>

      {/* PRODUCT TOEVOEGEN */}
      <section style={styles.section}>
        <h2>Nieuw onderdeel toevoegen</h2>

        <div style={styles.formGrid}>
          <input
            placeholder="Onderdeelnaam"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            placeholder="Onderdeelcode (OEM / bakcode)"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
          />
          <select
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          >
            <option>Magazijn A / Rek 1 / Vak A</option>
            <option>Magazijn A / Rek 3 / Vak B</option>
            <option>Magazijn B / Groot</option>
          </select>
          <input
            type="number"
            placeholder="Prijs €"
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
          Onderdeel toevoegen
        </button>
      </section>

      {/* PRODUCTEN */}
      <section style={styles.section}>
        <h2>Centrale onderdelenpool</h2>

        <table style={styles.table}>
          <thead>
            <tr>
              <th>Naam</th>
              <th>Code</th>
              <th>Locatie</th>
              <th>Voorraad</th>
              <th>Prijs</th>
              <th>Kanalen</th>
              <th>Label</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.code}</td>
                <td>{p.location}</td>
                <td>{p.stock}</td>
                <td>€{p.price}</td>
                <td>
                  {Object.entries(p.channels).map(([c, v]) => (
                    <label key={c} style={styles.channel}>
                      <input
                        type="checkbox"
                        checked={v}
                        onChange={() =>
                          setProducts(products.map(prod =>
                            prod.id === p.id
                              ? {
                                  ...prod,
                                  channels: {
                                    ...prod.channels,
                                    [c]: !v,
                                  },
                                }
                              : prod
                          ))
                        }
                      />
                      {c}
                    </label>
                  ))}
                </td>
                <td>
                  <button style={styles.smallBtn}>Print label</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* MAGAZIJN & LABELS */}
      <section style={styles.sectionAlt}>
        <h2>Magazijn & labels (USP)</h2>
        <ul>
          <li>✔ Vrije magazijnstructuur per klant</li>
          <li>✔ Labels met eigen velden (klant, marge, status)</li>
          <li>✔ QR-code per locatie of onderdeel</li>
          <li>✔ Meerdere labelprofielen per bedrijf</li>
        </ul>
      </section>

      {/* VERKOOPKANALEN */}
      <section style={styles.section}>
        <h2>Automatische verkoopkanalen</h2>
        <ul>
          <li>✓ Partagos centrale pool</li>
          <li>✓ Marktplaats 2e hands</li>
          <li>✓ eBay</li>
          <li>✓ RRR.lt</li>
        </ul>
      </section>

      <footer style={styles.footer}>
        Demo dashboard – geen echte transacties
      </footer>
    </div>
  );
}

function KPI({ label, value }) {
  return (
    <div style={styles.kpi}>
      <div style={styles.kpiValue}>{value}</div>
      <div style={styles.kpiLabel}>{label}</div>
    </div>
  );
}

/* ---------- STYLES ---------- */

const styles = {
  page: { padding: 20, background: "#f8fafc", minHeight: "100vh" },
  header: {
    background: "#fff",
    padding: 16,
    borderRadius: 10,
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 20,
    border: "1px solid #e5e7eb",
  },
  user: { fontSize: 13, opacity: 0.7 },
  kpis: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 12,
    marginBottom: 24,
  },
  kpi: {
    background: "#fff",
    padding: 16,
    borderRadius: 10,
    border: "1px solid #e5e7eb",
  },
  kpiValue: { fontSize: 24, fontWeight: "bold", color: "#16a34a" },
  kpiLabel: { fontSize: 13, opacity: 0.7 },
  section: {
    background: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    border: "1px solid #e5e7eb",
  },
  sectionAlt: {
    background: "#eefdf5",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    border: "1px solid #bbf7d0",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 10,
    marginBottom: 10,
  },
  primaryBtn: {
    background: "#16a34a",
    color: "#fff",
    padding: "10px 16px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
  },
  table: { width: "100%", borderCollapse: "collapse" },
  channel: { display: "block", fontSize: 12 },
  smallBtn: {
    background: "#16a34a",
    color: "#fff",
    border: "none",
    padding: "6px 10px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 12,
  },
  footer: {
    textAlign: "center",
    fontSize: 12,
    opacity: 0.6,
    marginTop: 30,
  },
};
