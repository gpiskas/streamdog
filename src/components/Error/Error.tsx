import "./Error.css";
import { preventDefault } from "../../utils";
import { resourceDir } from "@tauri-apps/api/path";
import { open } from "@tauri-apps/api/shell";
import { useLayoutEffect } from "react";

interface Props {
  message: string
}

export default function Error(props: Props) {

  useLayoutEffect(openSkins);

  function openSkins() {
    resourceDir().then(dir => open(`${dir}skins`));
  }

  function reload() {
    window.location.reload();
  }

  return (
    <div className="container"
      id="error"
      data-tauri-drag-region
      onContextMenu={preventDefault}>
      <div data-tauri-drag-region>{props.message}</div>
      <div data-tauri-drag-region>Please fix the skin issue!</div>
      <button onClick={reload}>Reload</button>
    </div>
  );
}
