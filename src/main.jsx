import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import Login from "./Login";
import Dashboard from "./Dashboard";

function render() {
  const path = window.location.pathname;

  let Page = App;
  if (path === "/login") Page = Login;
  if (path === "/dashboard") Page = Dashboard;

  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <Page />
    </React.StrictMode>
  );
}

render();

window.addEventListener("popstate", render);
