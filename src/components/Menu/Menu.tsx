import { Menu as Mainmenu, Item, RightSlot, Submenu, Separator, useContextMenu } from "react-contexify";
import { preventDefault } from "../../utils";
import "./Menu.css";
import { useContext } from "react";
import { GlobalContext } from "../GlobalContextProvider/GlobalContext";
import { resourceDir } from "@tauri-apps/api/path";
import { open } from "@tauri-apps/api/shell";
import { exit } from "@tauri-apps/api/process";
import { writeLayout } from "../GlobalContextProvider/layout";

export default function Menu() {
  const context = useContext(GlobalContext);
  const { show } = useContextMenu({ id: 'menu' });


  function clearLayout() {
    writeLayout(context.settings.selectedSkin, '').then(context.ops.reload);
  }

  function openInfo() {
    resourceDir().then(dir => open(`${dir}skins`)
      .then(_ => open(`${dir}skins\\README.txt`)));
  }

  function openSupportLink() {
    open("https://ko-fi.com/gpiskas");
  }

  function close() {
    exit(1);
  }

  console.debug('Rendering', Menu.name);
  return (
    <>
      <Mainmenu id="menu" onContextMenu={preventDefault}>
        <Item onClick={openInfo}>Info & Customization<RightSlot>🎬</RightSlot></Item>
        <Submenu className="skinsSubmenu" label={'Select skin...'}>
          {context.app.skinOptions.map(skin => <Item key={skin} onClick={_ => context.ops.selectSkin(skin)}>{skin}</Item>)}
        </Submenu>
        <Item onClick={clearLayout}>Clear layout<RightSlot>🗑️</RightSlot></Item>
        <Separator></Separator>
        <Item onClick={context.ops.toggleAlwaysOnTop}>{context.settings.alwaysOnTop ? 'Disable' : 'Enable'} always on top<RightSlot>📌</RightSlot></Item>
        <Item onClick={context.ops.toggleKeystrokes}>{context.settings.showKeystrokes ? 'Hide' : 'Show'} keystrokes<RightSlot>⌨️</RightSlot></Item>
        <Separator></Separator>
        <Item onClick={openSupportLink}>Support the developer<RightSlot>❤️</RightSlot></Item>
        <Item onClick={context.ops.reload}>Reload<RightSlot>🔄</RightSlot></Item>
        <Item onClick={close}>Exit<RightSlot>❌</RightSlot></Item>
      </Mainmenu>
      {context.app.windowFocused && <div id="menuButton"
        onContextMenu={event => show({ event })}
        onClick={event => show({ event })}>🍔</div>
      }
    </>
  );
}
