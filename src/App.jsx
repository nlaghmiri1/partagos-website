import React from "react";
import {
  Search,
  Boxes,
  Cpu,
  QrCode,
  Truck,
  Globe2,
  ShieldCheck,
  Receipt,
  Rocket,
  MessageSquare,
  Store,
  Upload,
  Settings,
  PackageSearch,
  Database,
  ChevronRight,
} from "lucide-react";

export default function App() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* HEADER */}
      <header className="sticky top-0 z-20 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500" />
            <span className="font-semibold tracking-tight">Partagos</span>
            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300">
              AI Parts Platform
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-300">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#search" className="hover:text-white">Zoeken</a>
            <a href="#vendors" className="hover:text-white">Vendors</a>
            <a href="#pricing" className="hover:text-white">Pricing</a>
            <a href="#contact" className="hover:text-white">Contact</a>
          </nav>

          {/* LOGIN KNOP */}
          <a
            href="/login"
            className="inline-flex items-center gap-2 text-sm bg-emerald-500 hover:bg-emerald-400 text-black font-medium px-4 py-2 rounded-xl"
          >
            Inloggen
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.15),transparent_50%)]" />
        <div className="max-w-7xl mx-auto px-4 pt-16 pb-12 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">
              Eén platform voor{" "}
              <span className="text-emerald-400">auto-onderdelenbeheer</span> én{" "}
              <span className="text-emerald-400">verkoop</span>
            </h1>

            <p className="mt-4 text-neutral-300 text-lg">
              Partagos combineert flexibel magazijnbeheer met een centrale
              zoekpool waarin de voorraad van aangesloten bedrijven samenkomt.
              Consumentenprijzen zijn openbaar, B2B en export lopen via offerte
              of contact.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="mailto:demo@partagos.nl"
                className="px-5 py-3 rounded-xl bg-white text-black font-semibold hover:opacity-90"
              >
                Demo aanvragen
              </a>
              <a
                href="#features"
                className="px-5 py-3 rounded-xl bg-neutral-900 border border-neutral-700 hover:border-neutral-500"
              >
                Bekijk features
              </a>
            </div>
          </div>

          {/* SEARCH MOCK */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5">
            <div className="rounded-xl border border-neutral-800 overflow-hidden">
              <div className="px-4 py-3 bg-neutral-950 text-neutral-300 flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                Demo zoeken
              </div>

              <div className="p-4" id="search">
                <div className="flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3">
                  <Search className="w-5 h-5 text-neutral-400" />
                  <input
                    className="bg-transparent outline-none w-full text-neutral-200 placeholder:text-neutral-500"
                    placeholder="Zoek op kenteken, VIN, motorcode, bakcode…"
                  />
                  <button className="px-3 py-1.5 text-sm rounded-lg bg-emerald-500 text-black font-medium">
                    Zoek
                  </button>
                </div>

                <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                  <div className="font-medium">
                    Versnellingsbak DQ400 • bakcode RJW
                  </div>
                  <div className="text-sm text-neutral-400">
                    OE: 0DD300045K · Voorraad: 1 · Prijs: €349
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-bold">
          Gebouwd voor de praktijk
        </h2>
        <p className="mt-2 text-neutral-300">
          SaaS-platform met operationele diepgang voor onderdelenbedrijven.
        </p>

        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Feature icon={<Boxes />} title="Centrale onderdelenpool" />
          <Feature icon={<QrCode />} title="Labels & QR-codes" />
          <Feature icon={<Cpu />} title="AI ondersteuning" />
          <Feature icon={<Truck />} title="Export & verzending" />
          <Feature icon={<ShieldCheck />} title="Rollen & rechten" />
          <Feature icon={<Receipt />} title="Offertes & facturen" />
          <Feature icon={<Rocket />} title="Schaalbaar SaaS" />
          <Feature icon={<Globe2 />} title="Meertalig & multi-tenant" />
        </div>
      </section>

      {/* VENDORS */}
      <section id="vendors" className="max-w-7xl mx-auto px-4 py-12">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Store /> Vendor portal
          </h3>
          <p className="mt-2 text-neutral-300">
            Leveranciers beheren hun eigen voorraad, die automatisch in de
            centrale pool verschijnt.
          </p>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 py-12">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6">
          <h3 className="text-xl font-bold">Abonnementen</h3>
          <p className="mt-2 text-neutral-400 text-sm">
            Onderdeelprijzen zijn openbaar. Platformprijzen zijn op aanvraag.
          </p>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="max-w-7xl mx-auto px-4 py-12">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6">
          <h3 className="text-xl font-bold">Contact</h3>
          <p className="mt-1 text-neutral-300">
            Neem contact op of vraag een demo aan.
          </p>
          <div className="mt-4 flex gap-3">
            <a
              href="mailto:demo@partagos.nl"
              className="px-5 py-3 rounded-xl bg-emerald-500 text-black font-semibold"
            >
              Demo aanvragen
            </a>
            <a
              href="mailto:info@partagos.nl"
              className="px-5 py-3 rounded-xl border border-neutral-700"
            >
              Contact
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-neutral-800 py-6 text-center text-sm text-neutral-400">
        © {new Date().getFullYear()} Partagos.nl — AI-gedreven auto-onderdelenplatform
      </footer>
    </div>
  );
}

function Feature({ icon, title }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 flex items-center gap-3">
      <div className="text-emerald-400">{icon}</div>
      <div className="font-medium">{title}</div>
    </div>
  );
}
