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

  const goTo = (path) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <header style={styles.header}>
        <strong>Partagos Dashboard</strong>
        <div style={styles.headerRight}>
          <span style={styles.user}>Demo Admin</span>
          <button onClick={() => goTo("/")} style={styles.linkBtn}>
            Uitloggen
          </button>
        </div>
      </header>

      {/* KPI */}
      <section style={styles.kpis}>
        <KPI label="Onderdelen" value={products.length} />
        <KPI label="Magazijnen" value="2" />
        <KPI
          label="Actieve advertenties"
          value={products.filter((p) =>
            Object.values(p.channels).some((v) => v)
          ).length}
        />
        <KPI label="Kanalen" value="4" />
      </section>

      {/* PRODUCTEN */}
      <section style={styles.section}>
        <h2>Centrale onderdelenpool</h2>
        <p style={styles.muted}>
          Deze onderdelen zijn zichtbaar voor consumenten en gekoppelde
          verkoopkanalen.
        </p>

        <table style={styles.table}>
          <thead>
            <tr>
              <th>Onderdeel</th>
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
                    <div key={c} style={styles.channel}>
                      {v ? "✓" : "–"} {c}
                    </div>
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

      {/* MAGAZIJN */}
      <section style={styles.sectionAlt}>
        <h2>Magazijn & labels (USP)</h2>
        <ul>
          <li>✔ Vrije magazijnstructuur per klant</li>
          <li>✔ Labels met klant-specifieke info</li>
          <li>✔ QR-codes per onderdeel of locatie</li>
          <li>✔ Directe koppeling met pick & verzending</li>
        </ul>
      </section>

      {/* VERKOOPKANALEN */}
      <section style={styles.section}>
        <h2>Automatische verkoopkanalen</h2>
        <ul>
          <li>✓ Partagos centrale pool</li>
          <li>✓ Marktplaats (2e hands)</li>
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
  page: {
    padding: 20,
    background: "#f8fafc",
    minHeight: "100vh",
    fontFamily: "Arial, sans-serif",
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
  headerRight: {
    display: "flex",
    gap: 12,
    alignItems: "center",
  },
  user: {
    fontSize: 13,
    opacity: 0.7,
  },
  linkBtn: {
    background: "none",
    border: "none",
    color: "#16a34a",
    cursor: "pointer",
    fontWeight: 600,
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
  channel: {
    fontSize: 12,
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
