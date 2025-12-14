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
    },
    {
      id: 2,
      name: "Mechatronic unit",
      code: "0DD325443A",
      location: "Magazijn B / Rek 1 / Vak A",
      price: 275,
      stock: 2,
    },
  ]);

  return (
    <div style={styles.page}>
      {/* TOP BAR */}
      <header style={styles.header}>
        <strong>Partagos Dashboard</strong>
        <span style={styles.user}>Ingelogd als: Demo Admin</span>
      </header>

      {/* KPI BLOCKS */}
      <section style={styles.kpis}>
        <KPI label="Actieve onderdelen" value={products.length} />
        <KPI label="Magazijnen" value="2" />
        <KPI label="Live advertenties" value={products.length} />
        <KPI label="Exportlanden" value="6" />
      </section>

      {/* PRODUCTEN */}
      <section style={styles.section}>
        <h2>Onderdelen (centrale pool)</h2>
        <p style={styles.muted}>
          Deze onderdelen zijn zichtbaar voor consumenten en externe platformen.
        </p>

        <table style={styles.table}>
          <thead>
            <tr>
              <th>Onderdeel</th>
              <th>Code</th>
              <th>Locatie</th>
              <th>Voorraad</th>
              <th>Prijs (€)</th>
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
                <td>{p.price}</td>
                <td>
                  <button style={styles.smallBtn}>Print label</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* MAGAZIJN */}
      <section style={styles.sectionAlt}>
        <h2>Magazijnstructuur</h2>
        <ul>
          <li>Magazijn A → Rek 1 t/m 5</li>
          <li>Magazijn B → Grote onderdelen</li>
          <li>Locaties gekoppeld aan QR & labels</li>
        </ul>
      </section>

      {/* AUTOMATISERING */}
      <section style={styles.section}>
        <h2>Automatische verkoopkanalen</h2>
        <ul>
          <li>✓ Marktplaats (2e hands)</li>
          <li>✓ eBay</li>
          <li>✓ RRR.lt</li>
          <li>✓ Centrale Partagos-pool</li>
        </ul>
      </section>

      {/* FOOTER */}
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
  page: {
    fontFamily: "Arial, sans-serif",
    padding: 20,
    background: "#f8fafc",
    minHeight: "100vh",
  },
  header: {
    background: "#ffffff",
    padding: 16,
    borderRadius: 10,
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 20,
    border: "1px solid #e5e7eb",
  },
  user: {
    fontSize: 13,
    opacity: 0.7,
  },
  kpis: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 12,
    marginBottom: 24,
  },
  kpi: {
    background: "#ffffff",
    padding: 16,
    borderRadius: 10,
    border: "1px solid #e5e7eb",
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#16a34a",
  },
  kpiLabel: {
    fontSize: 13,
    opacity: 0.7,
  },
  section: {
    background: "#ffffff",
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
  muted: {
    fontSize: 13,
    opacity: 0.7,
    marginBottom: 10,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  smallBtn: {
    background: "#16a34a",
    color: "#ffffff",
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
