import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import Login from "./Login.jsx";
import Dashboard from "./Dashboard.jsx";
import AdminCustomers from "./AdminCustomers.jsx";
import "./index.css";

function matchRoute(pathname) {
  if (pathname === "/login") return "login";
  if (pathname === "/dashboard") return "dashboard";
  if (pathname === "/admin/customers") return "admin-customers";
  return "home";
}

function Router() {
  const [path, setPath] = React.useState(window.location.pathname);

  React.useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const route = matchRoute(path);

  if (route === "login") return <Login />;
  if (route === "dashboard") return <Dashboard />;
  if (route === "admin-customers") return <AdminCustomers />;
  return <App />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>
);
