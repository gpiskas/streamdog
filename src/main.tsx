import "./styles.css";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App/App";
import { loadContextData, loadSkin } from "./startup";
import { GlobalContext, GlobalContextData } from "./GlobalContext";

loadSkin().then(_ => {
  console.log("Skin loaded");
  return loadContextData();
}).then(context => {
  console.log("Context loaded", context);
  renderApp(context);
});

function renderApp(context: GlobalContextData) {
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <GlobalContext.Provider value={context}>
        <App></App>
      </GlobalContext.Provider>
    </React.StrictMode>
  );
}