import "./Menu.css";
import { Menu as Mainmenu, Item, RightSlot, Submenu, Separator, useContextMenu } from "react-contexify";
import { listenToFocusChange as listenToWindowFocusChange, openSkinsFolder, preventDefault, registerListeners } from "../../utils";
import { useContext, useEffect, useRef } from "react";
import { GlobalContext } from "../GlobalContextProvider/GlobalContext";
import { open } from "@tauri-apps/api/shell";
import { exit } from "@tauri-apps/api/process";
import { writeLayout } from "../GlobalContextProvider/layout";

export default function Menu() {
  const context = useContext(GlobalContext);
  const menuButtonRef = useRef<HTMLDivElement>(null);
  const { show } = useContextMenu({ id: 'menu' });

  useEffect(listenToWindowFocus, []);

  function listenToWindowFocus() {
    return registerListeners(Menu.name,
      listenToWindowFocusChange(toggleMenuButton)
    );
  }

  function toggleMenuButton(enabled: boolean) {
    const el = menuButtonRef.current as HTMLElement;
    el.style.visibility = enabled ? 'visible' : 'hidden';
  }

  function clearLayout() {
    writeLayout(context.settings.selectedSkin, '').then(context.ops.reload);
  }

  function openInfo() {
    openSkinsFolder().then(dir => open(`${dir}skins\\README.txt`));
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
        <Submenu className="skinsSubmenu" label={'Select skin...'}>
          {context.app.skinOptions.map(skin => <Item key={skin} onClick={_ => context.ops.selectSkin(skin)}>{skin}</Item>)}
        </Submenu>
        <Item onClick={clearLayout}>Clear layout<RightSlot>🗑️</RightSlot></Item>
        <Separator></Separator>
        <Item onClick={context.ops.toggleAlwaysOnTop}>{context.settings.alwaysOnTop ? 'Disable' : 'Enable'} always on top<RightSlot>📌</RightSlot></Item>
        <Item onClick={context.ops.toggleKeystrokes}>{context.settings.showKeystrokes ? 'Hide' : 'Show'} keystrokes<RightSlot>⌨️</RightSlot></Item>
        <Separator></Separator>
        <Item onClick={openInfo}>Info & Customization<RightSlot>🎬</RightSlot></Item>
        <Item onClick={openSupportLink}>Support the developer<RightSlot>🍕</RightSlot></Item>
        <Separator></Separator>
        <Item onClick={context.ops.reload}>Reload<RightSlot>♾️</RightSlot></Item>
        <Item onClick={close}>Exit<RightSlot>❌</RightSlot></Item>
        <Item disabled>{context.app.info}<RightSlot>🤖</RightSlot></Item>
      </Mainmenu>
      <div id="menuButton" ref={menuButtonRef}
        onContextMenu={event => show({ event })}
        onClick={event => show({ event })}>🍔</div>
    </>
  );
}
