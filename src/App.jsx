import React from "react";
import {
  Search,
  Store,
  Warehouse,
  QrCode,
  Sticker,
  Boxes,
  Truck,
  Globe,
  MessageSquare,
  Mail,
  ChevronRight,
} from "lucide-react";

const EMAIL_DEMO = "demo@partagos.nl";
const EMAIL_INFO = "info@partagos.nl";

export default function App() {
  return (
    <div style={page}>
      {/* TOP BAR */}
      <header style={topBar}>
        <div style={containerWide}>
          <div style={brandRow}>
            <div style={logoDot} />
            <div>
              <div style={brandName}>Partagos</div>
              <div style={brandTag}>AI-gedreven SaaS • Operationeel platform</div>
            </div>
          </div>

          <nav style={nav}>
            <a style={navLink} href="#pool">
              Zoekpool
            </a>
            <a style={navLink} href="#warehouse">
              Magazijn & Labels
            </a>
            <a style={navLink} href="#channels">
              Kanalen
            </a>
            <a style={navLink} href="#contact">
              Contact
            </a>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section style={hero}>
        <div style={container}>
          <div style={heroGrid}>
            <div>
              <div style={pill}>Live • We bouwen door</div>
              <h1 style={h1}>
                Eén platform voor{" "}
                <span style={{ color: GREEN }}>onderdelenbeheer</span> én{" "}
                <span style={{ color: GREEN }}>verkoop</span>
              </h1>
              <p style={lead}>
                Partagos combineert flexibel magazijnbeheer met een centrale
                marktplaats: de voorraad van aangesloten bedrijven komt samen in
                één grote pool — met consumentenprijzen zichtbaar.
              </p>

              <div style={ctaRow}>
                <a href={`mailto:${EMAIL_DEMO}`} style={btnPrimary}>
                  <MessageSquare size={18} /> Demo aanvragen
                </a>
                <a href={`mailto:${EMAIL_INFO}`} style={btnSecondary}>
                  <Mail size={18} /> Contact opnemen
                </a>
              </div>

              <div style={trustRow}>
                <MiniStat label="Sneller verwerken" value="Labels & QR" />
                <MiniStat label="Meer bereik" value="Centrale pool" />
                <MiniStat label="Schaalbaar" value="SaaS platform" />
              </div>
            </div>

            {/* HERO SEARCH MOCK */}
            <div style={card}>
              <div style={cardHeader}>
                <div style={dot} />
                <div style={cardHeaderText}>Zoek (demo)</div>
              </div>

              <div style={cardBody}>
                <div style={searchBox}>
                  <Search size={18} />
                  <input
                    style={searchInput}
                    placeholder="Zoek op kenteken, VIN, motorcode, bakcode of onderdeelnummer…"
                    readOnly
                  />
                  <button type="button" style={searchBtn}>
                    Zoek
                  </button>
                </div>

                <div style={result}>
                  <div style={resultTop}>
                    <div style={resultBadge}>
                      <Store size={14} /> Aanbieder
                    </div>
                    <div style={priceTag}>€ 349</div>
                  </div>
                  <div style={resultTitle}>
                    Versnellingsbak DQ400 • bakcode RJW
                  </div>
                  <div style={resultMeta}>
                    OE/OEM: 0DD300045K • Motorcode: — • Locatie: B-12 • Voorraad:
                    1
                  </div>
                  <div style={resultActions}>
                    <a style={miniBtn} href="#pool">
                      Bekijk in pool
                      <ChevronRight size={16} />
                    </a>
                    <a style={miniBtn2} href={`mailto:${EMAIL_INFO}`}>
                      Vraag info
                      <ChevronRight size={16} />
                    </a>
                  </div>
                </div>

                <div style={note}>
                  Tip: in de echte versie kun je zoeken op meerdere criteria en
                  zie je meerdere aanbieders per onderdeel.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 50/50 SECTION */}
      <section style={section} id="pool">
        <div style={container}>
          <div style={splitGrid}>
            {/* POOL */}
            <div style={panel}>
              <div style={panelIcon}>
                <Globe size={18} />
              </div>
              <h2 style={h2}>Centrale zoekpool voor onderdelen</h2>
              <p style={p}>
                De voorraad van aangesloten sloperijen, handelaren en
                export/import partijen komt samen in één grote pool. Consumenten
                kunnen vrij zoeken en onderdeelprijzen zijn zichtbaar.
              </p>

              <ul style={ul}>
                <li style={li}>
                  Zoeken op <b>kenteken</b>, <b>VIN</b>, <b>motorcode</b>,{" "}
                  <b>versnellingsbakcode</b> of <b>onderdeelnummer</b>
                </li>
                <li style={li}>
                  Resultaten van <b>meerdere aanbieders</b> in één overzicht
                </li>
                <li style={li}>
                  B2B / export kan via <b>offerte</b> of <b>contact</b>
                </li>
              </ul>
            </div>

            {/* WAREHOUSE */}
            <div style={panel} id="warehouse">
              <div style={panelIcon}>
                <Warehouse size={18} />
              </div>
              <h2 style={h2}>Magazijnbeheer dat zich aanpast aan jouw werkwijze</h2>
              <p style={p}>
                Richt je magazijn in zoals jij werkt — zones, stellingen, bakken,
                pallets. En print per onderdeel precies de informatie die jij
                nodig hebt: handmatig én automatisch.
              </p>

              <div style={featureGrid}>
                <Feature
                  icon={<Boxes size={18} />}
                  title="Vrije magazijnstructuur"
                  text="Meerdere magazijnen, zones en locaties — zonder vaste beperkingen."
                />
                <Feature
                  icon={<Sticker size={18} />}
                  title="Stickerprofielen"
                  text="Per bedrijf/rol/proces: magazijn, verkoop, export of kanaal-specifiek."
                />
                <Feature
                  icon={<QrCode size={18} />}
                  title="QR als sleutel"
                  text="Scan → direct product, locatie, status en historie."
                />
                <Feature
                  icon={<Truck size={18} />}
                  title="Handmatig + automatisch"
                  text="On-demand print of automatische prints bij aanmaak/import/status."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CHANNELS */}
      <section style={sectionAlt} id="channels">
        <div style={container}>
          <h2 style={h2}>Eén keer toevoegen, meerdere kanalen</h2>
          <p style={p}>
            Partagos is gebouwd om voorraad en verkoop te schalen. Vanuit één
            productbeheer kun je publicatie naar meerdere verkoopkanalen
            automatiseren (module in opbouw).
          </p>

          <div style={channelGrid}>
            <ChannelCard title="Marktplaats" />
            <ChannelCard title="2dehands" />
            <ChannelCard title="rrr.lt" />
            <ChannelCard title="eBay" />
          </div>

          <div style={roadmapNote}>
            <b>Roadmap:</b> automatische advertentietemplates, status-sync
            (verkocht/uitverkocht), prijsregels per kanaal en bulk publishing.
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section style={section} id="contact">
        <div style={container}>
          <div style={contactCard}>
            <div>
              <h2 style={{ ...h2, marginTop: 0 }}>Klaar om te starten?</h2>
              <p style={p}>
                Vraag een demo aan of neem contact op. We kunnen je eerste
                dataset/voorraad direct meenemen in de onboarding.
              </p>
              <div style={ctaRow}>
                <a href={`mailto:${EMAIL_DEMO}`} style={btnPrimary}>
                  <MessageSquare size={18} /> Demo aanvragen
                </a>
                <a href={`mailto:${EMAIL_INFO}`} style={btnSecondary}>
                  <Mail size={18} /> Contact opnemen
                </a>
              </div>
              <div style={contactMeta}>
                Demo: <a href={`mailto:${EMAIL_DEMO}`}>{EMAIL_DEMO}</a> • Info:{" "}
                <a href={`mailto:${EMAIL_INFO}`}>{EMAIL_INFO}</a>
              </div>
            </div>

            <div style={miniChecklist}>
              <div style={checkTitle}>Wat je vandaag al live hebt</div>
              <div style={checkItem}>• Professionele landing (SaaS + operatie)</div>
              <div style={checkItem}>• Centrale pool verhaal + USP magazijn/labels</div>
              <div style={checkItem}>• Demo- & contactflow via e-mail</div>
              <div style={checkItem}>• Roadmap kanaalpublicatie (zonder loze beloftes)</div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={footer}>
        <div style={containerWide}>
          <div>© {new Date().getFullYear()} Partagos.nl</div>
          <div style={{ opacity: 0.8 }}>
            Onderdeelprijzen openbaar (B2C) • Abonnement op aanvraag
          </div>
        </div>
      </footer>
    </div>
  );
}

function Feature({ icon, title, text }) {
  return (
    <div style={featureCard}>
      <div style={featureIcon}>{icon}</div>
      <div style={featureTitle}>{title}</div>
      <div style={featureText}>{text}</div>
    </div>
  );
}

function ChannelCard({ title }) {
  return (
    <div style={channelCard}>
      <div style={channelTitle}>{title}</div>
      <div style={channelSub}>Automatische publicatie (module)</div>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div style={miniStat}>
      <div style={miniStatLabel}>{label}</div>
      <div style={miniStatValue}>{value}</div>
    </div>
  );
}

/* ---------- Styles (inline, simple & stable) ---------- */

const GREEN = "#16a34a";

const page = {
  fontFamily: "Arial, sans-serif",
  color: "#0b0f14",
  background: "#ffffff",
};

const topBar = {
  position: "sticky",
  top: 0,
  zIndex: 10,
  background: "rgba(255,255,255,0.9)",
  borderBottom: "1px solid #e6e6e6",
  backdropFilter: "blur(10px)",
};

const containerWide = {
  maxWidth: 1180,
  margin: "0 auto",
  padding: "14px 20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 14,
};

const container = {
  maxWidth: 1100,
  margin: "0 auto",
  padding: "0 20px",
};

const brandRow = { display: "flex", alignItems: "center", gap: 12 };
const logoDot = { width: 12, height: 12, borderRadius: 999, background: GREEN };
const brandName = { fontWeight: 800, letterSpacing: -0.2, fontSize: 18 };
const brandTag = { fontSize: 12, opacity: 0.7, marginTop: 2 };

const nav = { display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "flex-end" };
const navLink = { color: "#0b0f14", textDecoration: "none", fontSize: 13, opacity: 0.8 };

const hero = {
  padding: "58px 0 28px",
  background:
    "radial-gradient(1000px 400px at 20% 0%, rgba(22,163,74,0.14), transparent 60%)",
};

const heroGrid = {
  display: "grid",
  gridTemplateColumns: "1.1fr 0.9fr",
  gap: 26,
  alignItems: "start",
};

const pill = {
  display: "inline-block",
  padding: "6px 10px",
  borderRadius: 999,
  background: "rgba(22,163,74,0.10)",
  color: GREEN,
  fontWeight: 700,
  fontSize: 12,
};

const h1 = { fontSize: 44, fontWeight: 900, lineHeight: 1.12, margin: "14px 0 10px", letterSpacing: -0.6 };
const lead = { fontSize: 16.5, lineHeight: 1.55, maxWidth: 720, margin: "0 0 18px", opacity: 0.9 };

const ctaRow = { display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginTop: 12 };

const btnBase = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "12px 16px",
  borderRadius: 10,
  textDecoration: "none",
  fontWeight: 800,
  fontSize: 14,
};

const btnPrimary = { ...btnBase, background: GREEN, color: "#fff", border: "1px solid #0f7a35" };
const btnSecondary = { ...btnBase, background: "#fff", color: GREEN, border: `2px solid ${GREEN}` };

const trustRow = { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10, marginTop: 18 };

const miniStat = { border: "1px solid #e8e8e8", borderRadius: 12, padding: 12, background: "#fff" };
const miniStatLabel = { fontSize: 12, opacity: 0.65 };
const miniStatValue = { fontSize: 13.5, fontWeight: 800, marginTop: 6 };

const card = { border: "1px solid #e8e8e8", borderRadius: 16, overflow: "hidden", background: "#fff" };
const cardHeader = { display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", borderBottom: "1px solid #efefef" };
const dot = { width: 10, height: 10, borderRadius: 999, background: GREEN };
const cardHeaderText = { fontSize: 13, fontWeight: 800, opacity: 0.8 };
const cardBody = { padding: 14 };

const searchBox = {
  display: "flex",
  gap: 10,
  alignItems: "center",
  border: "1px solid #e6e6e6",
  borderRadius: 12,
  padding: "10px 12px",
  background: "#fafafa",
};

const searchInput = {
  border: "none",
  outline: "none",
  width: "100%",
  background: "transparent",
  fontSize: 13,
};

const searchBtn = {
  background: GREEN,
  color: "#fff",
  border: "1px solid #0f7a35",
  borderRadius: 10,
  padding: "8px 12px",
  fontWeight: 800,
  cursor: "pointer",
};

const result = { marginTop: 12, border: "1px solid #e8e8e8", borderRadius: 12, padding: 12 };
const resultTop = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 };
const resultBadge = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  borderRadius: 999,
  padding: "6px 10px",
  background: "rgba(22,163,74,0.10)",
  color: GREEN,
  fontWeight: 800,
  fontSize: 12,
};
const priceTag = { fontWeight: 900, color: "#0b0f14" };
const resultTitle = { marginTop: 8, fontWeight: 900 };
const resultMeta = { marginTop: 6, fontSize: 12.5, opacity: 0.75, lineHeight: 1.4 };
const resultActions = { marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" };

const miniBtn = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  border: "1px solid #e6e6e6",
  background: "#fff",
  borderRadius: 999,
  padding: "8px 10px",
  fontWeight: 800,
  fontSize: 12.5,
  textDecoration: "none",
  color: "#0b0f14",
};
const miniBtn2 = { ...miniBtn, border: `1px solid ${GREEN}`, color: GREEN };

const note = { marginTop: 10, fontSize: 12.5, opacity: 0.65, lineHeight: 1.4 };

const section = { padding: "56px 0" };
const sectionAlt = { padding: "56px 0", background: "#f7f7f7" };

const splitGrid = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, alignItems: "stretch" };

const panel = {
  border: "1px solid #e8e8e8",
  borderRadius: 16,
  padding: 18,
  background: "#fff",
};

const panelIcon = {
  width: 36,
  height: 36,
  borderRadius: 12,
  background: "rgba(22,163,74,0.10)",
  color: GREEN,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const h2 = { fontSize: 26, fontWeight: 900, letterSpacing: -0.4, margin: "12px 0 10px" };
const p = { fontSize: 14.5, lineHeight: 1.65, opacity: 0.9, margin: 0 };

const ul = { marginTop: 12, paddingLeft: 18, lineHeight: 1.6 };
const li = { marginTop: 8, fontSize: 14, opacity: 0.9 };

const featureGrid = { marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 };
const featureCard = { border: "1px solid #ececec", borderRadius: 14, padding: 12, background: "#fff" };
const featureIcon = { color: GREEN };
const featureTitle = { marginTop: 8, fontWeight: 900, fontSize: 13.5 };
const featureText = { marginTop: 6, fontSize: 12.8, opacity: 0.75, lineHeight: 1.45 };

const channelGrid = { marginTop: 16, display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12 };
const channelCard = { border: "1px solid #e8e8e8", borderRadius: 16, padding: 14, background: "#fff" };
const channelTitle = { fontWeight: 900 };
const channelSub = { marginTop: 6, fontSize: 12.5, opacity: 0.7 };

const roadmapNote = {
  marginTop: 14,
  border: "1px dashed #cfd8cf",
  background: "rgba(22,163,74,0.06)",
  borderRadius: 16,
  padding: 14,
  lineHeight: 1.55,
  fontSize: 13.5,
};

const contactCard = {
  border: "1px solid #e8e8e8",
  borderRadius: 18,
  padding: 18,
  display: "grid",
  gridTemplateColumns: "1.2fr 0.8fr",
  gap: 16,
  background: "#fff",
};

const contactMeta = { marginTop: 12, fontSize: 13, opacity: 0.75 };
const miniChecklist = { border: "1px solid #ededed", borderRadius: 16, padding: 14, background: "#fafafa" };
const checkTitle = { fontWeight: 900, marginBottom: 10 };
const checkItem = { fontSize: 13.3, opacity: 0.85, marginTop: 8, lineHeight: 1.4 };

const footer = { padding: "18px 0", borderTop: "1px solid #e6e6e6", background: "#fff" };

/* Responsive fallback (simple) */
const styleTag = document?.getElementById?.("__partagos_style");
if (!styleTag) {
  try {
    const tag = document.createElement("style");
    tag.id = "__partagos_style";
    tag.innerHTML = `
      @media (max-width: 980px) {
        .__ignore { }
      }
    `;
    document.head.appendChild(tag);
  } catch {}
}

/* Notes:
   - Inline styles keep this Vite MVP stable.
   - Next step: convert to Tailwind and add NL/EN toggle + real search flow.
*/
