import React from "react";
import {
  Boxes,
  Cpu,
  QrCode,
  Truck,
  Globe,
  MessageSquare,
  Mail,
} from "lucide-react";

export default function App() {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", color: "#111" }}>
      {/* HERO */}
      <section style={{ padding: "80px 20px", maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ fontSize: 44, fontWeight: 700, lineHeight: 1.2 }}>
          Partagos<br />
          <span style={{ color: "#16a34a" }}>
            AI-gedreven SaaS voor auto-onderdelen
          </span>
        </h1>

        <p style={{ fontSize: 18, marginTop: 20, maxWidth: 700 }}>
          Partagos is een modern SaaS-platform dat auto-onderdelenbedrijven helpt
          hun dagelijkse operatie te digitaliseren.  
          Van sloperij tot onderdelenhandel en export — alles in één systeem.
        </p>

        {/* CTA BUTTONS */}
        <div style={{ marginTop: 30, display: "flex", gap: 16, flexWrap: "wrap" }}>
          <a
            href="mailto:demo@partagos.nl"
            style={primaryBtn}
          >
            <MessageSquare size={18} /> Demo aanvragen
          </a>

          <a
            href="mailto:info@partagos.nl"
            style={secondaryBtn}
          >
            <Mail size={18} /> Contact opnemen
          </a>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ background: "#f7f7f7", padding: "60px 20px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ fontSize: 32, marginBottom: 30 }}>
            Gebouwd voor de praktijk
          </h2>

          <div style={grid}>
            <Feature
              icon={<Boxes />}
              title="Slimme onderdelen­catalogus"
              text="Zoeken op OE, OEM, motorcode of voertuig. Minder fouten, sneller verkopen."
            />
            <Feature
              icon={<QrCode />}
              title="Labels & QR-codes"
              text="Label elk onderdeel direct bij demontage. Perfect voor magazijn en picken."
            />
            <Feature
              icon={<Cpu />}
              title="AI-ondersteuning"
              text="Slimme assistent voor zoeken, klantvragen en retouren."
            />
            <Feature
              icon={<Truck />}
              title="Export & verzending"
              text="Voorbereid op export, pro-forma, HS-codes en internationale verkoop."
            />
            <Feature
              icon={<Globe />}
              title="Multi-tenant SaaS"
              text="Meerdere bedrijven, magazijnen en gebruikers in één platform."
            />
          </div>
        </div>
      </section>

      {/* STATUS */}
      <section style={{ padding: "40px 20px", textAlign: "center" }}>
        <p style={{ opacity: 0.7 }}>
          🚧 Partagos is live en wordt actief doorontwikkeld.  
          Wil je meedenken of als eerste starten? Neem gerust contact op.
        </p>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid #ddd", padding: 20, textAlign: "center", fontSize: 14 }}>
        © {new Date().getFullYear()} Partagos.nl — AI-gedreven auto-onderdelen SaaS
      </footer>
    </div>
  );
}

function Feature({ icon, title, text }) {
  return (
    <div style={{ background: "#fff", padding: 24, borderRadius: 8 }}>
      <div style={{ color: "#16a34a", marginBottom: 10 }}>{icon}</div>
      <h3 style={{ marginBottom: 8 }}>{title}</h3>
      <p style={{ opacity: 0.8 }}>{text}</p>
    </div>
  );
}

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: 20,
};

const primaryBtn = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  background: "#16a34a",
  color: "#fff",
  padding: "14px 22px",
  borderRadius: 6,
  textDecoration: "none",
  fontWeight: 600,
};

const secondaryBtn = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  border: "2px solid #16a34a",
  color: "#16a34a",
  padding: "12px 20px",
  borderRadius: 6,
  textDecoration: "none",
  fontWeight: 600,
};
