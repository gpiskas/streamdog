import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App/App";
import "./styles.css";
import { ResourceContext, Resources, loadResources } from "./ResourceContext";

loadResources().then(resources => {
  console.log("Resources loaded, rendering app");
  renderApp(resources);
})

function renderApp(resources: Resources) {
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <ResourceContext.Provider value={resources}>
        <App></App>
      </ResourceContext.Provider>
    </React.StrictMode>
  );
}