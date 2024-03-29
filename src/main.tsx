import "./styles.css";
import ReactDOM from "react-dom/client";
import App from "./components/App/App";
import GlobalContextProvider from "./components/GlobalContextProvider/GlobalContextProvider";
import { preventAllDefaultKeystrokesInProd } from "./utils";

preventAllDefaultKeystrokesInProd();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <GlobalContextProvider>
    <App></App>
  </GlobalContextProvider>
);