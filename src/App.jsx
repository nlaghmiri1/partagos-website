import React from "react";

function goTo(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export default function App() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="sticky top-0 z-20 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500" />
            <div className="font-semibold tracking-tight">Partagos</div>
            <div className="ml-2 text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300">
              AI Parts SaaS
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => goTo("/login")}
              className="px-4 py-2 rounded-xl bg-white text-black font-semibold hover:opacity-90"
            >
              Inloggen
            </button>
            <a
              href="mailto:demo@partagos.nl"
              className="px-4 py-2 rounded-xl border border-neutral-700 hover:border-neutral-500"
            >
              Demo aanvragen
            </a>
            <a
              href="mailto:info@partagos.nl"
              className="px-4 py-2 rounded-xl border border-neutral-700 hover:border-neutral-500"
            >
              Contact
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-14">
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">
          Eén platform voor auto-onderdelenbeheer én verkoop
        </h1>
        <p className="mt-4 text-neutral-300 text-lg max-w-3xl">
          Partagos combineert flexibel magazijnbeheer met een centrale zoekpool waarin de voorraad van aangesloten bedrijven samenkomt.
          Consumentenprijzen voor onderdelen kunnen openbaar, terwijl B2B/export via offerte of contact loopt.
        </p>

        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <Feature title="Centrale onderdelenpool" desc="Alle aangesloten voorraad in één grote pool." />
          <Feature title="Labels & QR/barcode" desc="Per klant aanpasbare labels, PDF export en scanning." />
          <Feature title="Decoder & fitment" desc="Kenteken/VIN → voertuigdata → koppelen aan voorraad." />
          <Feature title="Marketplaces" desc="Framework voor Marktplaats / eBay / RRR.lt publishing." />
          <Feature title="Multi-tenant" desc="Meerdere bedrijven, eigen rechten en pakket-limieten." />
          <Feature title="Schaalbaar SaaS" desc="Starter → Growth → Scale, klaar voor opschaling." />
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <button
            onClick={() => goTo("/login")}
            className="px-5 py-3 rounded-xl bg-emerald-500 text-black font-semibold hover:bg-emerald-400"
          >
            Naar inloggen
          </button>
          <a
            href="mailto:demo@partagos.nl"
            className="px-5 py-3 rounded-xl bg-neutral-900 border border-neutral-700 hover:border-neutral-500"
          >
            Demo aanvragen
          </a>
        </div>

        <div className="mt-10 text-sm text-neutral-400">
          Live terwijl we doorbouwen. Voor toegang: invite-only (accounts worden door Partagos aangemaakt).
        </div>
      </main>

      <footer className="border-t border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 py-8 text-sm text-neutral-400 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>© {new Date().getFullYear()} Partagos</div>
          <div className="flex items-center gap-4">
            <a className="hover:text-neutral-200" href="mailto:info@partagos.nl">Support</a>
            <a className="hover:text-neutral-200" href="#">Privacy</a>
            <a className="hover:text-neutral-200" href="#">Voorwaarden</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Feature({ title, desc }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4">
      <div className="font-semibold text-emerald-300">{title}</div>
      <div className="mt-1 text-sm text-neutral-300">{desc}</div>
    </div>
  );
}
