import "./Error.css";
import { preventDefault } from "../../utils";
import { resourceDir } from "@tauri-apps/api/path";
import { open } from "@tauri-apps/api/shell";
import { useContext, useLayoutEffect } from "react";
import { GlobalContext } from "../GlobalContextProvider/context";

export default function Error() {
  const context = useContext(GlobalContext);

  useLayoutEffect(openSkins);

  function openSkins() {
    resourceDir().then(dir => open(`${dir}skins`));
  }

  return (
    <div className="container"
      id="error"
      data-tauri-drag-region
      onContextMenu={preventDefault}>
      <div data-tauri-drag-region>{context.errorMessage}</div>
      <div data-tauri-drag-region>Please fix the issue!</div>
      <button onClick={context.reload}>Reload</button>
      <button onClick={context.resetSettings}>Reset settings</button>
    </div>
  );
}
