import "./styles.css";
import ReactDOM from "react-dom/client";
import App from "./components/App/App";
import GlobalContextProvider from "./components/GlobalContextProvider/GlobalContextProvider";
import { preventAllDefaultKeystrokes } from "./utils";

preventAllDefaultKeystrokes();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <GlobalContextProvider>
    <App></App>
  </GlobalContextProvider>
);