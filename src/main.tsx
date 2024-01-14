import "./styles.css";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App/App";
import { loadContextData } from "./data/context";
import { GlobalContext, GlobalContextData } from "./components/GlobalContext";
import { loadSkin } from "./data/skin";

loadContextData().then(context => {
  console.log("Context loaded", context);
  loadSkin(context).then(_ => renderApp(context));
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