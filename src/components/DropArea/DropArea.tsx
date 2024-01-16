import "./DropArea.css";
import 'react-contexify/ReactContexify.css';
import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Moveable from "moveable";
import { Item, Menu, Separator, RightSlot, useContextMenu, Submenu, } from 'react-contexify';
import { appWindow } from '@tauri-apps/api/window';
import { BaseDirectory, createDir, exists, readTextFile, removeDir, writeBinaryFile, writeTextFile } from "@tauri-apps/api/fs";
import { resolveResource, resourceDir } from '@tauri-apps/api/path';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { exit } from '@tauri-apps/api/process';
import { preventDefault, registerListeners } from "../../utils";
import { open } from "@tauri-apps/api/shell";
import { GlobalContext } from "../GlobalContextProvider/GlobalContext";

export default function DropArea() {
  const context = useContext(GlobalContext);
  const [windowFocused, setWindowFocused] = useState<boolean>();
  const dropAreaRef = useRef<HTMLDivElement>(null);
  const { show, hideAll } = useContextMenu({ id: 'menu' });

  useEffect(listenToWindowFocus, []);
  useLayoutEffect(loadLayout, []);

  function listenToWindowFocus() {
    appWindow.isFocused().then(focused => setWindowFocused(focused));
    return registerListeners(DropArea.name,
      appWindow.onFocusChanged(({ payload: focused }) => {
        toggleMoveables(focused);
        setWindowFocused(focused);
      })
    );
  }

  function loadLayout() {
    console.log("Loading layout")
    const layoutFile = getLayoutDirPath('positions');
    exists(layoutFile, { dir: BaseDirectory.Resource })
      .then(fileExists => fileExists ? readTextFile(layoutFile, { dir: BaseDirectory.Resource }) : null)
      .then(innerHTML => {
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
    getOrCreateLayoutDir()
      .then(_ => writeTextFile(getLayoutDirPath('positions'), content, { dir: BaseDirectory.Resource }));
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
    const dropArea = dropAreaRef.current as HTMLElement;
    const imagePromises = Array.from(event.dataTransfer.files)
      .filter(file => file.type.startsWith("image"))
      .map(file => {
        return saveImage(file).then(path => {
          const image = document.createElement("img");
          image.classList.add("droppedElement");
          image.src = convertFileSrc(path);
          image.style.top = event.clientY - 25 + 'px';
          image.style.left = event.clientX - 25 + 'px';
          return image;
        });
      });

    Promise.all(imagePromises).then(images => {
      images.forEach(image => {
        dropArea.appendChild(image);
        makeElementMovable(image as HTMLElement);
      });
      saveLayout();
    });
  }

  function makeElementMovable(element: HTMLElement) {
    const moveable = new Moveable(dropAreaRef.current as HTMLElement, {
      target: element,
      // ables: [Editable],
      // props: { editable: true },
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
    element.ondblclick = _ => {
      moveable.destroy();
      element.remove();
      saveLayout();
    };
    return moveable;
  }

  function getLayoutDirPath(path: string = '') {
    return `skins/${context.settings.selectedSkin}/.layout/${path}`;
  }

  function getOrCreateLayoutDir(): Promise<void> {
    return createDir(getLayoutDirPath(), { dir: BaseDirectory.Resource, recursive: true });
  }

  function deleteLayout() {
    removeDir(getLayoutDirPath(), { dir: BaseDirectory.Resource, recursive: true })
      .then(context.ops.reload);
  }

  function saveImage(file: File): Promise<string> {
    const dir = getLayoutDirPath(file.name);
    return getOrCreateLayoutDir()
      .then(_ => file.arrayBuffer())
      .then(bytes => writeBinaryFile(dir, bytes, { dir: BaseDirectory.Resource }))
      .then(_ => resolveResource(dir));
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
          <Item onClick={deleteLayout}>Delete layout<RightSlot>🗑️</RightSlot></Item>
          <Separator></Separator>
          <Item onClick={context.ops.toggleAlwaysOnTop}>{context.settings.alwaysOnTop ? 'Disable' : 'Enable'} always on top<RightSlot>📌</RightSlot></Item>
          <Item onClick={context.ops.toggleKeystrokes}>{context.settings.showKeystrokes ? 'Hide' : 'Show'} keystrokes<RightSlot>⌨️</RightSlot></Item>
          <Separator></Separator>
          <Item onClick={openSupportLink}>Support the developer<RightSlot>❤️</RightSlot></Item>
          <Item onClick={context.ops.reload}>Reload<RightSlot>🔄</RightSlot></Item>
          <Item onClick={close}>Exit<RightSlot>❌</RightSlot></Item>
        </Menu>
      </div>
      {windowFocused && <div id="menuButton"
        onContextMenu={event => show({ event })}
        onClick={event => show({ event })}>🍔</div>
      }
    </div>
  );
}