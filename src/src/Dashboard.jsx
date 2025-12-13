import React from "react";
import { Boxes, Warehouse, QrCode, Plus } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="border-b border-neutral-800 px-6 py-4 flex justify-between">
        <div>
          <div className="font-bold">Partagos Demo</div>
          <div className="text-xs text-neutral-400">
            Ingelogd als Admin
          </div>
        </div>
        <a href="/" className="text-sm text-neutral-400 hover:text-white">
          Uitloggen
        </a>
      </header>

      <main className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-neutral-400 mt-1">
          Dit is een demo-omgeving om de flow te testen.
        </p>

        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <Card
            icon={<Boxes />}
            title="Producten"
            desc="Voeg onderdelen toe, beheer prijzen en voorraad."
          />
          <Card
            icon={<Warehouse />}
            title="Magazijn"
            desc="Zones, stellingen, bakken en locaties instellen."
          />
          <Card
            icon={<QrCode />}
            title="Labels"
            desc="Stickerprofielen en QR-codes beheren."
          />
        </div>

        <div className="mt-8">
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-black font-semibold">
            <Plus className="w-4 h-4" /> Nieuw product (demo)
          </button>
        </div>
      </main>
    </div>
  );
}

function Card({ icon, title, desc }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
      <div className="text-emerald-400 mb-2">{icon}</div>
      <div className="font-semibold">{title}</div>
      <div className="text-sm text-neutral-400 mt-1">{desc}</div>
    </div>
  );
}
