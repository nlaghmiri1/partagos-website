import React from "react";

function goTo(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-8 rounded-2xl shadow max-w-sm w-full">
        <h2 className="text-xl font-semibold mb-4">Inloggen bij Partagos</h2>

        <p className="text-sm text-slate-500 mb-6">
          Demo-omgeving — authenticatie volgt later
        </p>

        <button
          onClick={() => goTo("/dashboard")}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl"
        >
          Ga naar dashboard
        </button>

        <button
          onClick={() => goTo("/")}
          className="w-full mt-3 border border-slate-300 px-4 py-2 rounded-xl"
        >
          Terug
        </button>
      </div>
    </div>
  );
}
