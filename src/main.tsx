import "./styles.css";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App/App";
import GlobalContextProvider from "./components/GlobalContextProvider/GlobalContextProvider";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <GlobalContextProvider>
      <App></App>
    </GlobalContextProvider>
  </React.StrictMode>
);