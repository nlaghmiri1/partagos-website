import { useState } from "react";
import { supabase } from "./supabaseClient";

export default function PublicSearch() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);

  async function search() {
    const { data } = await supabase
      .from("products")
      .select("name, part_number, engine_code, gearbox_code, price")
      .or(
        `name.ilike.%${q}%,part_number.ilike.%${q}%,engine_code.ilike.%${q}%,gearbox_code.ilike.%${q}%`
      )
      .limit(50);

    setResults(data || []);
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-2xl shadow">
        <h1 className="text-xl font-bold mb-4">
          Zoek auto-onderdelen
        </h1>

        <div className="flex gap-2 mb-4">
          <input
            className="flex-1 border rounded-xl px-4 py-2"
            placeholder="Onderdeelnummer, motorcode, bakcode…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button
            onClick={search}
            className="bg-emerald-600 text-white px-4 rounded-xl"
          >
            Zoek
          </button>
        </div>

        <table className="w-full text-sm">
          <thead className="border-b text-left">
            <tr>
              <th>Naam</th>
              <th>Nr</th>
              <th>Motor</th>
              <th>Bak</th>
              <th>Prijs</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={i} className="border-b">
                <td>{r.name}</td>
                <td>{r.part_number}</td>
                <td>{r.engine_code}</td>
                <td>{r.gearbox_code}</td>
                <td>€{r.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
