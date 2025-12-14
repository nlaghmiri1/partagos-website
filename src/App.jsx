import React, { useEffect, useState } from "react";
import Dashboard from "./Dashboard";
import Login from "./Login";

function goTo(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export default function App() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handler = () => setPath(window.location.pathname);
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  if (path === "/login") return <Login />;
  if (path === "/dashboard") return <Dashboard />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-10 rounded-2xl shadow max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Partagos</h1>
        <p className="text-slate-500 mb-6">
          AI-gedreven SaaS platform voor auto-onderdelen
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => goTo("/login")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl"
          >
            Login
          </button>

          <button
            onClick={() => goTo("/dashboard")}
            className="border border-slate-300 px-4 py-2 rounded-xl"
          >
            Ga naar dashboard (demo)
          </button>
        </div>
      </div>
    </div>
  );
}
