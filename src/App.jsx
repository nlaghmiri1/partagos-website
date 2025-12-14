import { useEffect, useState } from "react";
import Login from "./Login";
import Dashboard from "./Dashboard";
import PublicSearch from "./PublicSearch";
import AdminCustomers from "./AdminCustomers";

function goTo(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export default function App() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  if (path === "/login") return <Login />;
  if (path === "/dashboard") return <Dashboard />;
  if (path === "/zoeken") return <PublicSearch />;
  if (path === "/admin/customers") return <AdminCustomers />;

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="bg-white p-10 rounded-2xl shadow max-w-lg w-full text-center">
        <h1 className="text-3xl font-bold mb-3">Partagos</h1>

        <p className="text-slate-600 mb-8">
          AI-gedreven SaaS platform voor auto-onderdelen, magazijnbeheer en multi-tenant verkoop.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => goTo("/login")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-medium"
          >
            Inloggen
          </button>

          <button
            onClick={() => goTo("/dashboard")}
            className="border border-slate-300 hover:bg-slate-50 px-5 py-3 rounded-xl"
          >
            Ga naar dashboard
          </button>

          <button
            onClick={() => goTo("/admin/customers")}
            className="border border-slate-300 hover:bg-slate-50 px-5 py-3 rounded-xl"
          >
            Admin: nieuwe klant aanmaken
          </button>

          <button
            onClick={() => goTo("/zoeken")}
            className="text-emerald-700 underline mt-2"
          >
            Publiek onderdelen zoeken
          </button>
        </div>

        <div className="mt-8 text-xs text-slate-400">
          © {new Date().getFullYear()} Partagos
        </div>
      </div>
    </div>
  );
}
