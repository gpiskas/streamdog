import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App/App";
import "./styles.css";
import { loadResources } from "./ResourceContext";

loadResources().then(_ => {
  console.log("Resources loaded, rendering app");
  renderApp();
})

function renderApp() {
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <App></App>
    </React.StrictMode>
  );
}