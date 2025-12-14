import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import Login from "./Login.jsx";
import Dashboard from "./Dashboard.jsx";
import AdminCustomers from "./AdminCustomers.jsx";
import PublicProduct from "./PublicProduct.jsx";
import "./index.css";

function Router() {
  const [path, setPath] = React.useState(window.location.pathname);

  React.useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // dynamic public product page: /p/<slug>
  if (path.startsWith("/p/")) return <PublicProduct />;

  if (path === "/login") return <Login />;
  if (path === "/dashboard") return <Dashboard />;
  if (path === "/admin/customers") return <AdminCustomers />;

  return <App />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>
);
