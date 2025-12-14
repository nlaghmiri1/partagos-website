import React, { useRef } from "react";

export default function PartagoLanding() {
  const loginRef = useRef<HTMLDivElement>(null);

  const scrollToLogin = () => {
    loginRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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
            <a href="#vendors">Vendors</a>
            <a href="#pricing">Pricing</a>
            <a href="#contact">Contact</a>
          </nav>

          <button onClick={scrollToLogin} style={styles.loginBtn}>
            Inloggen
          </button>
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
              zoekpool waarin onderdelen van meerdere bedrijven samenkomen.
            </p>

            <div style={styles.ctaRow}>
              <a href="mailto:demo@partagos.nl" style={styles.primaryBtn}>
                Demo aanvragen
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={styles.section}>
        <h2>Gebouwd voor de praktijk</h2>
        <p>Magazijn, labels, verkoop en automatisering in één platform.</p>
      </section>

      {/* LOGIN */}
      <section style={styles.sectionAlt}>
        <div ref={loginRef}>
          <h2>Inloggen (demo)</h2>
          <p>
            Dit is een demo-omgeving. De klantenomgeving wordt momenteel gebouwd.
          </p>

          <div style={{ marginTop: 20 }}>
            <button style={styles.primaryBtn}>
              Ga naar demo dashboard
            </button>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" style={styles.section}>
        <h2>Contact</h2>
        <p>demo@partagos.nl · info@partagos.nl</p>
      </section>

      <footer style={styles.footer}>
        © {new Date().getFullYear()} Partagos.nl
      </footer>
    </div>
  );
}

/* ---------- STYLES ---------- */

const styles: any = {
  page: { fontFamily: "Arial, sans-serif", background: "#fff" },
  header: {
    position: "sticky",
    top: 0,
    background: "#fff",
    borderBottom: "1px solid #e5e7eb",
    zIndex: 10,
  },
  headerInner: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "12px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brand: { display: "flex", gap: 10, alignItems: "center" },
  logo: { width: 14, height: 14, borderRadius: 99, background: "#16a34a" },
  tag: { fontSize: 11, opacity: 0.6 },
  nav: { display: "flex", gap: 14 },
  loginBtn: {
    background: "#16a34a",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
  },
  hero: { padding: "60px 20px", background: "#f8fafc" },
  heroInner: { maxWidth: 1100, margin: "0 auto" },
  h1: { fontSize: 36 },
  green: { color: "#16a34a" },
  lead: { fontSize: 16, lineHeight: 1.6 },
  ctaRow: { marginTop: 20 },
  primaryBtn: {
    background: "#16a34a",
    color: "#fff",
    padding: "10px 18px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
  },
  section: { maxWidth: 1100, margin: "0 auto", padding: "60px 20px" },
  sectionAlt: { background: "#f8fafc", padding: "80px 20px" },
  footer: {
    borderTop: "1px solid #e5e7eb",
    padding: 20,
    textAlign: "center",
    fontSize: 13,
    opacity: 0.7,
  },
};
