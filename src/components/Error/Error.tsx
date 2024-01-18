import "./Error.css";
import { openSkinsFolder, preventDefault } from "../../utils";
import { useContext, useLayoutEffect } from "react";
import { GlobalContext } from "../GlobalContextProvider/GlobalContext";

export default function Error() {
  const context = useContext(GlobalContext);

  useLayoutEffect(openSkins, []);

  function openSkins() {
    openSkinsFolder();
  }

  console.debug('Rendering', Error.name);
  return (
    <div id="error"
      className="container"
      data-tauri-drag-region
      onContextMenu={preventDefault}>
      <div data-tauri-drag-region>{context.app.errorMessage}</div>
      <div data-tauri-drag-region>Please fix the issue!</div>
      <button onClick={context.ops.reload}>Reload</button>
      <button onClick={context.ops.resetSettings}>Reset settings</button>
    </div>
  );
}
