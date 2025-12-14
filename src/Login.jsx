import React from "react";

export default function Login() {
  const goToDashboard = () => {
    window.history.pushState({}, "", "/dashboard");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1>Inloggen bij Partagos</h1>

        <p style={styles.text}>
          Testomgeving – backend is nog in ontwikkeling.
        </p>

        <button onClick={goToDashboard} style={styles.primaryBtn}>
          Ga naar demo-omgeving
        </button>

        <p style={styles.note}>
          Je logt in als <strong>Partagos Demo (Admin)</strong>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8fafc",
    fontFamily: "Arial, sans-serif",
  },
  card: {
    background: "#ffffff",
    padding: 30,
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    maxWidth: 420,
    width: "100%",
    textAlign: "center",
  },
  text: {
    margin: "12px 0 20px",
    opacity: 0.8,
  },
  primaryBtn: {
    background: "#16a34a",
    color: "#ffffff",
    padding: "12px 18px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
    width: "100%",
  },
  note: {
    marginTop: 16,
    fontSize: 13,
    opacity: 0.7,
  },
};
