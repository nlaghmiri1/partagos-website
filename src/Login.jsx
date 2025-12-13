import React from "react";

export default function Login() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
        <h1 className="text-2xl font-bold">Inloggen bij Partagos</h1>
        <p className="mt-2 text-neutral-400 text-sm">
          Testomgeving – backend is nog in ontwikkeling
        </p>

        <div className="mt-6 space-y-3">
          <button
            onClick={() => (window.location.href = "/dashboard")}
            className="w-full py-3 rounded-xl bg-emerald-500 text-black font-semibold"
          >
            Ga naar demo-omgeving
          </button>

          <div className="text-xs text-neutral-500 text-center">
            Je logt in als <b>Partagos Demo (Admin)</b>
          </div>
        </div>
      </div>
    </div>
  );
}
