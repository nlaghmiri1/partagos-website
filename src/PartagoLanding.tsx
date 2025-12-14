import React from "react";

export default function PartagoLanding() {
  return (
    <div style={styles.page}>
      {/* HEADER */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.brand}>
            <div style={styles.logo} />
            <div>
              <strong>Partagos</strong>
              <div style={styles.tag}>AI-gedreven auto-onderdelenplatform</div>
            </div>
          </div>

          <nav style={styles.nav}>
            <a href="#features">Features</a>
            <a href="#search">Zoeken</a>
            <a href="#vendors">Vendors</a>
            <a href="#pricing">Pricing</a>
            <a href="#contact">Contact</a>
          </nav>

          <a href="#login" style={styles.loginBtn}>
            Inloggen
          </a>
        </div>
      </header>

      {/* HERO */}
      <section style={styles.hero}>
        <div style={styles.heroInner}>
          <div>
            <h1 style={styles.h1}>
              Eén platform voor{" "}
              <span style={styles.green}>auto-onderdelenbeheer</span> én{" "}
              <span style={styles.green}>verkoop</span>
            </h1>

            <p style={styles.lead}>
              Partagos combineert flexibel magazijnbeheer met een centrale
              zoekpool. Onderdelen van meerdere bedrijven komen samen in één
              platform — consumentenprijzen zijn zichtbaar.
            </p>

            <div style={styles.ctaRow}>
              <a href="mailto:demo@partagos.nl" style={styles.primaryBtn}>
                Demo aanvragen
              </a>
              <a href="#features" style={styles.secondaryBtn}>
                Bekijk features
              </a>
            </div>
          </div>

          {/* SEARCH MOCK */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>Demo zoeken</div>
            <div style={styles.cardBody} id="search">
              <input
                style={styles.input}
                placeholder="Zoek op kenteken, VIN, motorcode, bakcode…"
              />
              <button style={styles.searchBtn}>Zoek</button>

              <div style={styles.result}>
                <strong>Versnellingsbak DQ400 • RJW</strong>
                <div style={styles.resultMeta}>
                  OE: 0DD300045K • Voorraad: 1 • Prijs: €349
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={styles.section}>
        <h2>Gebouwd voor de praktijk</h2>
        <p>SaaS-platform met operationele diepgang voor onderdelenbedrijven.</p>

        <div style={styles.features}>
          {[
            "Centrale onderdelenpool",
            "Magazijnbeheer & labels",
            "QR-codes per onderdeel",
            "Automatische advertenties",
            "Export & verzending",
            "Rollen & rechten",
            "Offertes & B2B",
            "Schaalbaar SaaS-platform",
          ].map((f) => (
            <div key={f} style={styles.featureCard}>
              {f}
            </div>
          ))}
        </div>
      </section>

      {/* VENDORS */}
      <section id="vendors" style={styles.sectionAlt}>
        <h2>Voor sloperijen & onderdelenhandel</h2>
        <p>
          Elk aangesloten bedrijf beheert zijn eigen voorraad, terwijl de
          onderdelen automatisch zichtbaar worden in de centrale zoekpool.
        </p>
      </section>

      {/* PRICING */}
      <section id="pricing" style={styles.section}>
        <h2>Abonnementen</h2>
        <p>
          Prijzen van onderdelen zijn openbaar. Platformprijzen zijn uitsluitend
          op aanvraag.
        </p>
      </section>

      {/* LOGIN (DEMO) */}
      <section id="login" style={styles.sectionAlt}>
        <h2>Inloggen (demo)</h2>
        <p>
          Dit is een testomgeving. De volledige klantenomgeving wordt momenteel
          gebouwd.
        </p>

        <div style={{ marginTop: 20 }}>
          <a href="#dashboard" style={styles.primaryBtn}>
            Ga naar demo dashboard
          </a>
        </div>
      </section>

      {/* DASHBOARD PLACEHOLDER */}
      <section id="dashboard" style={styles.section}>
        <h2>Demo dashboard</h2>
        <p>
          Hier komt de klantenomgeving waar bedrijven producten toevoegen,
          magazijnen beheren en labels instellen.
        </p>

        <ul style={{ marginTop: 12 }}>
          <li>• Productbeheer</li>
          <li>• Magazijnstructuur</li>
          <li>• Labelprofielen</li>
          <li>• Automatische advertenties</li>
        </ul>
      </section>

      {/* CONTACT */}
      <section id="contact" style={styles.sectionAlt}>
        <h2>Contact</h2>
        <p>Vraag een demo aan of neem contact met ons op.</p>

        <div style={styles.ctaRow}>
          <a href="mailto:demo@partagos.nl" style={styles.primaryBtn}>
            Demo aanvragen
          </a>
          <a href="mailto:info@partagos.nl" style={styles.secondaryBtn}>
            Contact
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={styles.footer}>
        © {new Date().getFullYear()} Partagos.nl — AI-gedreven
        auto-onderdelenplatform
      </footer>
    </div>
  );
}

/* ---------- STYLES ---------- */

const styles: any = {
  page: {
    fontFamily: "Arial, sans-serif",
    color: "#0b0f14",
    background: "#ffffff",
  },
  header: {
    position: "sticky",
    top: 0,
    background: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    zIndex: 10,
  },
  headerInner: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "12px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  brand: { display: "flex", gap: 10, alignItems: "center" },
  logo: {
    width: 14,
    height: 14,
    borderRadius: 99,
    background: "#16a34a",
  },
  tag: { fontSize: 11, opacity: 0.6 },
  nav: { display: "flex", gap: 14 },
  loginBtn: {
    background: "#16a34a",
    color: "#ffffff",
    padding: "8px 14px",
    borderRadius: 8,
    textDecoration: "none",
    fontWeight: 600,
  },
  hero: {
    background: "#f8fafc",
    padding: "60px 20px",
  },
  heroInner: {
    maxWidth: 1100,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1.2fr 0.8fr",
    gap: 30,
  },
  h1: { fontSize: 36, marginBottom: 12 },
  green: { color: "#16a34a" },
  lead: { fontSize: 16, lineHeight: 1.6 },
  ctaRow: { display: "flex", gap: 12, marginTop: 16 },
  primaryBtn: {
    background: "#16a34a",
    color: "#ffffff",
    padding: "10px 18px",
    borderRadius: 8,
    textDecoration: "none",
    fontWeight: 600,
  },
  secondaryBtn: {
    border: "1px solid #d1d5db",
    padding: "10px 18px",
    borderRadius: 8,
    textDecoration: "none",
    color: "#0b0f14",
  },
  card: {
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    background: "#ffffff",
  },
  cardHeader: {
    padding: 12,
    borderBottom: "1px solid #e5e7eb",
    fontWeight: 600,
  },
  cardBody: { padding: 12 },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 10,
  },
  searchBtn: {
    background: "#16a34a",
    color: "#ffffff",
    padding: "8px 14px",
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
  },
  result: {
    marginTop: 12,
    padding: 10,
    border: "1px solid #e5e7eb",
    borderRadius: 8,
  },
  resultMeta: { fontSize: 13, opacity: 0.7 },
  section: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "60px 20px",
  },
  sectionAlt: {
    background: "#f8fafc",
    padding: "60px 20px",
  },
  features: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: 12,
    marginTop: 20,
  },
  featureCard: {
    border: "1px solid #e5e7eb",
    padding: 16,
    borderRadius: 10,
    background: "#ffffff",
  },
  footer: {
    borderTop: "1px solid #e5e7eb",
    padding: 20,
    textAlign: "center",
    fontSize: 13,
    opacity: 0.7,
  },
};
