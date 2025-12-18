import React from "react";

export default function App() {
  const navLinks = [
    { label: "Diensten", href: "#services" },
    { label: "Waarom Fresco", href: "#why" },
    { label: "Sectoren", href: "#sectors" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="sticky top-0 z-20 border-b border-white/5 bg-slate-950/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-400 shadow-lg shadow-rose-500/30" />
            <div>
              <div className="text-lg font-bold tracking-tight">Fresco Facility B.V.</div>
              <div className="text-xs text-slate-400">Brandwacht & veiligheidsdiensten</div>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-200">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="hover:text-rose-300 transition">
                {link.label}
              </a>
            ))}
            <a
              href="tel:+31600000000"
              className="px-4 py-2 rounded-xl bg-white text-slate-900 font-semibold shadow hover:opacity-90"
            >
              Bel direct
            </a>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-white/5">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-slate-900 to-slate-950" />
          <div className="max-w-6xl mx-auto px-4 py-16 relative">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-rose-400/40 bg-rose-500/10 px-3 py-1 text-rose-200 text-xs font-semibold">
                  24/7 inzetbare brandwachten · Landelijk dekking
                </div>
                <h1 className="mt-6 text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">
                  Veiligheid zonder compromis voor industrie, bouw en events
                </h1>
                <p className="mt-4 text-lg text-slate-200/90">
                  Fresco Facility B.V. levert gecertificeerde brandwachten, veiligheidswachten en gasmeetdiensten.
                  Met korte lijnen, helder advies en een team dat begrijpt wat continuïteit betekent.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href="mailto:info@frescofacility.nl"
                    className="px-5 py-3 rounded-xl bg-rose-500 text-white font-semibold shadow-lg shadow-rose-500/40 hover:bg-rose-400"
                  >
                    Offerte aanvragen
                  </a>
                  <a
                    href="tel:+31600000000"
                    className="px-5 py-3 rounded-xl border border-white/10 text-slate-50 hover:border-rose-400"
                  >
                    Direct bellen
                  </a>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-slate-300">
                  <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                    <div className="text-2xl font-bold text-rose-200">15+</div>
                    <div className="text-slate-300">Jaar ervaring met hoog-risico locaties</div>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                    <div className="text-2xl font-bold text-rose-200">ISO & VCA</div>
                    <div className="text-slate-300">Gecertificeerde professionals en processen</div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -top-10 -left-6 w-32 h-32 bg-rose-500/30 blur-3xl" />
                <div className="absolute -bottom-16 -right-6 w-36 h-36 bg-amber-400/20 blur-3xl" />
                <div className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-xl shadow-black/40 relative">
                  <div className="text-sm text-rose-200 font-semibold">Scenario ready</div>
                  <h2 className="mt-2 text-2xl font-bold">Van planvorming tot uitvoering</h2>
                  <p className="mt-3 text-slate-300 text-sm leading-relaxed">
                    Onze brandwachten zijn gewend aan shutdowns, warm-werk vergunningen, confined space entry en het
                    begeleiden van contractors. We denken mee over procedures, stellen de juiste middelen beschikbaar en
                    rapporteren helder.
                  </p>
                  <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                    {[
                      "Industriële brandwacht",
                      "Bouwplaats toezicht",
                      "Gasmeten & ventilatie",
                      "Evenementen & publiek",
                      "BHV & EHBO",
                      "Stand-by teams",
                    ].map((item) => (
                      <div key={item} className="rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-slate-200">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="max-w-6xl mx-auto px-4 py-16">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold">Onze brandwacht diensten</h2>
            <span className="text-sm text-slate-400">Op maat inzetbaar, 24/7 beschikbaar</span>
          </div>
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            {services.map((service) => (
              <ServiceCard key={service.title} {...service} />
            ))}
          </div>
        </section>

        <section id="why" className="border-y border-white/5 bg-slate-900/40">
          <div className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-3xl font-bold">Waarom kiezen voor Fresco Facility?</h2>
              <p className="mt-3 text-slate-300">
                Wij combineren de wendbaarheid van een specialistisch team met de zekerheid van gecertificeerde processen.
                Eén aanspreekpunt, heldere rapportage en personeel dat begrijpt wat er op het spel staat.
              </p>
              <ul className="mt-4 space-y-3 text-slate-200">
                {[
                  "Gecertificeerde brand- en veiligheidswachten met actuele keuringen",
                  "Snelle inzet bij storingen, onderhoudsstops en evenementen",
                  "Kennis van industrie, petrochemie, bouw en publieke ruimtes",
                  "Beschikbaar voor korte klussen én langdurige projecten",
                ].map((item) => (
                  <li key={item} className="flex gap-3 items-start">
                    <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-rose-500/20 text-rose-200 font-semibold">
                      ✓
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-white/5 bg-gradient-to-br from-slate-900 to-slate-950 p-6 shadow-xl">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <Stat label="Respons binnen" value="< 1 uur" />
                <Stat label="Beschikbaarheid" value="24/7" />
                <Stat label="Regio's" value="Landelijk" />
                <Stat label="Persoonlijk aanspreekpunt" value="1" />
              </div>
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 text-slate-200">
                "We schakelen met Fresco Facility omdat ze meedenken in veiligheidsplannen, niet alleen leveren."
                <div className="mt-3 text-sm text-slate-400">Operations manager, industrieklant</div>
              </div>
            </div>
          </div>
        </section>

        <section id="sectors" className="max-w-6xl mx-auto px-4 py-16">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold">Sectoren die we bedienen</h2>
            <span className="text-sm text-slate-400">Elke omgeving vraagt zijn eigen veiligheidsplan</span>
          </div>
          <div className="mt-8 grid md:grid-cols-3 gap-4 text-sm text-slate-200">
            {["Industrie & (petro)chemie", "Bouw & renovatie", "Evenementen & publiek", "Utiliteit & zorg", "Logistiek & warehouses", "Maritiem & havens"].map((sector) => (
              <div key={sector} className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
                {sector}
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-white/5 bg-rose-500/10">
          <div className="max-w-6xl mx-auto px-4 py-14 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="text-sm font-semibold text-rose-200 uppercase tracking-wide">Klaar voor actie</div>
              <h2 className="mt-2 text-3xl font-bold">Plan direct een inzet of veiligheidsronde</h2>
              <p className="mt-2 text-slate-200 max-w-2xl">
                Vertel ons de locatie, benodigde certificeringen en het tijdstip. Wij leveren de juiste brandwachten,
                inclusief materieel en rapportage.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="mailto:info@frescofacility.nl"
                className="px-5 py-3 rounded-xl bg-white text-slate-900 font-semibold shadow hover:opacity-90"
              >
                Mail ons
              </a>
              <a
                href="tel:+31600000000"
                className="px-5 py-3 rounded-xl border border-rose-200 text-rose-100 hover:bg-rose-500/20"
              >
                Bel +31 6 0000 0000
              </a>
            </div>
          </div>
        </section>

        <section id="contact" className="max-w-6xl mx-auto px-4 py-16">
          <div className="rounded-3xl border border-white/5 bg-slate-900/60 p-6 grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <h2 className="text-3xl font-bold">Contact opnemen</h2>
              <p className="mt-2 text-slate-300">
                We reageren snel met een concrete oplossing. Neem contact op voor directe inzet, advies of een offerte op maat.
              </p>
              <div className="mt-6 grid md:grid-cols-2 gap-4 text-sm text-slate-200">
                <ContactItem label="Telefoon" value="06 0000 0000" href="tel:+31600000000" />
                <ContactItem label="E-mail" value="info@frescofacility.nl" href="mailto:info@frescofacility.nl" />
                <ContactItem label="Standplaats" value="Landelijke dekking vanuit Randstad" />
                <ContactItem label="Beschikbaarheid" value="24/7 bereikbaar" />
              </div>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/5 p-5 text-sm text-slate-200">
              <div className="text-rose-200 font-semibold">Snelle start</div>
              <p className="mt-2 text-slate-300">
                Mail uw locatie, datum, aantal posten en benodigde certificering. We plannen direct de juiste bezetting.
              </p>
              <ul className="mt-3 space-y-2 text-slate-300">
                <li>• Brand- & veiligheidswachten</li>
                <li>• Gasmeetdienst en ventilatie</li>
                <li>• BHV / EHBO ondersteuning</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 py-8 text-sm text-slate-400 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>© {new Date().getFullYear()} Fresco Facility B.V. | Brandwacht & veiligheidsdiensten</div>
          <div className="flex items-center gap-4">
            <a className="hover:text-rose-200" href="mailto:info@frescofacility.nl">Mail</a>
            <a className="hover:text-rose-200" href="tel:+31600000000">Bel</a>
            <a className="hover:text-rose-200" href="#contact">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

const services = [
  {
    title: "Industriële brandwacht",
    description:
      "Toezicht tijdens onderhoudsstops, heet werk en confined space entry. Volledig uitgerust en procedurevast.",
    highlights: ["Warmwerk vergunningen", "Ademlucht & redding", "Rapportage per shift"],
  },
  {
    title: "Bouwplaats brandwacht",
    description: "Preventieve en corrigerende brandwachten die toezicht houden op brandrisico's en werkvergunningen.",
    highlights: ["Materieel checks", "Werkinstructies naleven", "Veilige afsluiting dag"],
  },
  {
    title: "Gasmeten & ventilatie",
    description: "Gecertificeerde gasmeetkundigen met moderne apparatuur voor besloten ruimtes en risicovolle installaties.",
    highlights: ["Explosie- en toxische metingen", "Ventilatie advies", "Directe rapportage"],
  },
  {
    title: "Evenementen & publiek",
    description: "Inzetbare brandwachten en EHBO'ers voor evenementen, crowd control en noodprocedures.",
    highlights: ["Ontruimingsplannen", "Samenwerking hulpdiensten", "Bezoekersveiligheid"],
  },
  {
    title: "BHV & EHBO",
    description: "Professionals die ondersteunen bij bedrijfsveiligheid, calamiteitenorganisatie en eerste hulp.",
    highlights: ["Getrainde teams", "Veiligheidsrondes", "Aanvulling interne organisatie"],
  },
  {
    title: "Stand-by interventies",
    description: "24/7 inzetbare teams voor storingen, brandmeldingen of tijdelijke verhoogde risico's.",
    highlights: ["Snelle mobilisatie", "Altijd bereikbaar", "Passende bezetting"],
  },
];

function ServiceCard({ title, description, highlights }) {
  return (
    <div className="rounded-3xl border border-white/5 bg-slate-900/60 p-6 shadow-lg shadow-black/30 flex flex-col gap-4">
      <div>
        <div className="text-sm font-semibold text-rose-200">Dienst</div>
        <h3 className="text-xl font-bold mt-1">{title}</h3>
        <p className="mt-2 text-slate-300 text-sm leading-relaxed">{description}</p>
      </div>
      <div className="flex flex-wrap gap-2 text-xs text-slate-200">
        {highlights.map((item) => (
          <span key={item} className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
      <div className="text-sm text-slate-400">{label}</div>
      <div className="mt-1 text-2xl font-bold text-rose-200">{value}</div>
    </div>
  );
}

function ContactItem({ label, value, href }) {
  const content = (
    <div className="flex flex-col">
      <span className="text-xs uppercase tracking-wide text-slate-400">{label}</span>
      <span className="text-base text-slate-100 font-semibold">{value}</span>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="rounded-xl border border-white/5 bg-white/5 p-4 hover:border-rose-300/60 transition">
        {content}
      </a>
    );
  }

  return (
    <div className="rounded-xl border border-white/5 bg-white/5 p-4">
      {content}
    </div>
  );
}
