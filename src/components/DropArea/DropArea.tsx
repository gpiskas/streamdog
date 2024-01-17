import "./DropArea.css";
import 'react-contexify/ReactContexify.css';
import React, { useContext, useEffect, useLayoutEffect, useRef } from 'react';
import Moveable from "moveable";
import { Item, Menu, Separator, RightSlot, useContextMenu, Submenu, } from 'react-contexify';
import { resourceDir } from '@tauri-apps/api/path';
import { exit } from '@tauri-apps/api/process';
import { preventDefault } from "../../utils";
import { open } from "@tauri-apps/api/shell";
import { GlobalContext } from "../GlobalContextProvider/GlobalContext";
import { Destroyable } from "./Destroyable";
import { readLayout, writeLayout } from "../GlobalContextProvider/layout";
import { appWindow } from "@tauri-apps/api/window";

export default function DropArea() {
  const context = useContext(GlobalContext);
  const dropAreaRef = useRef<HTMLDivElement>(null);
  const { show, hideAll } = useContextMenu({ id: 'menu' });

  useEffect(listenToWindowFocus, [context.app.windowFocused]);
  useLayoutEffect(loadLayout, []);

  function listenToWindowFocus() {
    toggleMoveables(context.app.windowFocused);
  }

  function loadLayout() {
    console.log("Loading layout")
    readLayout(context.settings.selectedSkin).then(innerHTML => {
      if (innerHTML) {
        const container = dropAreaRef.current as HTMLElement;
        container.innerHTML = innerHTML;
        toggleMoveables(true);
      }
    });
  }

  function saveLayout() {
    const dropAreaCopy = dropAreaRef.current?.cloneNode(true) as HTMLElement;
    dropAreaCopy.querySelectorAll(".moveable-control-box")
      .forEach(element => element.remove());
    const content = dropAreaCopy.innerHTML.toString();
    writeLayout(context.settings.selectedSkin, content);
  }

  function clearLayout() {
    writeLayout(context.settings.selectedSkin, '').then(context.ops.reload);
  }

  function toggleMoveables(enabled: boolean) {
    const dropArea = dropAreaRef.current as HTMLElement;
    if (enabled) {
      document.querySelectorAll(".droppedElement")
        .forEach(element => makeElementMovable(element as HTMLElement));
    } else {
      dropArea.querySelectorAll(".moveable-control-box")
        .forEach(element => element.remove());
    }
  }

  function createDropElement(event: React.DragEvent<HTMLElement>) {
    preventDefault(event);
    const imagePromises = Array.from(event.dataTransfer.files)
      .filter(file => file.type.startsWith("image"))
      .map(file => {
        return new Promise<HTMLImageElement>(resolve => {
          var reader = new FileReader();
          reader.onload = () => {
            const image = document.createElement("img");
            image.classList.add("droppedElement");
            image.style.top = event.clientY - 25 + 'px';
            image.style.left = event.clientX - 25 + 'px';
            image.src = reader.result as string;
            resolve(image);
          };
          reader.readAsDataURL(file);
        });
      });

    Promise.all(imagePromises).then(images => {
      const dropArea = dropAreaRef.current as HTMLElement;
      images.forEach(image => {
        dropArea.appendChild(image);
        makeElementMovable(image);
      });
      saveLayout();
      appWindow.setFocus();
    });
  }

  function makeElementMovable(element: HTMLElement) {
    const moveable = new Moveable(dropAreaRef.current as HTMLElement, {
      target: element,
      ables: [Destroyable],
      props: { destroyable: true },
      draggable: true,
      throttleDrag: 0,
      startDragRotate: 0,
      throttleDragRotate: 0,
      scalable: true,
      throttleScale: 0,
      keepRatio: false,
      renderDirections: ["nw", "ne", "sw", "se"],
      rotatable: true,
      throttleRotate: 0,
      rotationPosition: "top"
    }).on("render", e => e.target.style.transform = e.transform)
      .on("renderEnd", saveLayout);
    moveable.on("warpEnd", _ => {
      moveable.destroy();
      element.remove();
      saveLayout();
    });
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

  function hasNoDroppedElements() {
    return document.querySelectorAll(".droppedElement").length == 0;
  }

  console.debug('Rendering', DropArea.name);
  return (
    <div className="container">
      <div className="container"
        ref={dropAreaRef}
        onContextMenu={event => show({ event })}
        onMouseDown={hideAll}
        onDragOver={preventDefault}
        onDrop={createDropElement}
        data-tauri-drag-region>
      </div>
      <div onContextMenu={preventDefault}>
        <Menu id="menu">
          <Item onClick={openInfo}>Info & Customization<RightSlot>🎬</RightSlot></Item>
          <Submenu className="skinsSubmenu" label={'Select skin...'}>
            {context.app.skinOptions.map(skin => <Item key={skin} onClick={_ => context.ops.selectSkin(skin)}>{skin}</Item>)}
          </Submenu>
          <Item disabled={hasNoDroppedElements} onClick={clearLayout}>Clear layout<RightSlot>🗑️</RightSlot></Item>
          <Separator></Separator>
          <Item onClick={context.ops.toggleAlwaysOnTop}>{context.settings.alwaysOnTop ? 'Disable' : 'Enable'} always on top<RightSlot>📌</RightSlot></Item>
          <Item onClick={context.ops.toggleKeystrokes}>{context.settings.showKeystrokes ? 'Hide' : 'Show'} keystrokes<RightSlot>⌨️</RightSlot></Item>
          <Separator></Separator>
          <Item onClick={openSupportLink}>Support the developer<RightSlot>❤️</RightSlot></Item>
          <Item onClick={context.ops.reload}>Reload<RightSlot>🔄</RightSlot></Item>
          <Item onClick={close}>Exit<RightSlot>❌</RightSlot></Item>
        </Menu>
      </div>
      {context.app.windowFocused && <div id="menuButton"
        onContextMenu={event => show({ event })}
        onClick={event => show({ event })}>🍔</div>
      }
    </div>
  );
}