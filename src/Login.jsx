import React from "react";

/**
 * Partagos – Demo Login
 * - Geen backend
 * - Geen echte auth
 * - SPA-safe (Vercel-proof)
 */

export default function Login() {
  const goToDashboard = () => {
    window.history.pushState({}, "", "/dashboard");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const goBack = () => {
    window.history.pushState({}, "", "/");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* LOGO / TITLE */}
        <div style={styles.logoWrap}>
          <div style={styles.logo}>P</div>
          <h1 style={styles.title}>Inloggen bij Partagos</h1>
        </div>

        <p style={styles.subtitle}>
          Testomgeving – backend is nog in ontwikkeling.
        </p>

        {/* DEMO INFO */}
        <div style={styles.demoBox}>
          <div><strong>Demo account</strong></div>
          <div>Rol: Admin</div>
          <div>Bedrijf: Partagos Demo BV</div>
        </div>

        {/* ACTION */}
        <button onClick={goToDashboard} style={styles.primaryBtn}>
          Ga naar demo-omgeving
        </button>

        <button onClick={goBack} style={styles.linkBtn}>
          ← Terug naar homepage
        </button>

        {/* FOOTER NOTE */}
        <div style={styles.note}>
          Deze login is uitsluitend bedoeld voor demo- en validatiedoeleinden.
        </div>
      </div>
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f0fdf4, #f8fafc)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Arial, sans-serif",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    background: "#ffffff",
    borderRadius: 16,
    padding: "28px 26px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
    textAlign: "center",
  },
  logoWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    background: "#16a34a",
    color: "#ffffff",
    fontWeight: 900,
    fontSize: 22,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    margin: 0,
    fontSize: 22,
    fontWeight: 900,
  },
  subtitle: {
    margin: "6px 0 16px",
    fontSize: 14,
    opacity: 0.7,
  },
  demoBox: {
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: 12,
    padding: 12,
    marginBottom: 18,
    fontSize: 13,
    lineHeight: 1.5,
  },
  primaryBtn: {
    width: "100%",
    background: "#16a34a",
    color: "#ffffff",
    padding: "12px 16px",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    fontWeight: 800,
    fontSize: 15,
  },
  linkBtn: {
    marginTop: 12,
    background: "none",
    border: "none",
    color: "#16a34a",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 13,
  },
  note: {
    marginTop: 18,
    fontSize: 12,
    opacity: 0.6,
  },
};
