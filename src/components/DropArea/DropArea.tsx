import "./DropArea.css";
import 'react-contexify/ReactContexify.css';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Moveable from "moveable";
import { Item, Menu, Separator, RightSlot, useContextMenu } from 'react-contexify';
import { appWindow } from '@tauri-apps/api/window';
import { BaseDirectory, createDir, exists, readTextFile, removeDir, writeBinaryFile, writeTextFile } from "@tauri-apps/api/fs";
import { appConfigDir, resourceDir } from '@tauri-apps/api/path';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { exit } from '@tauri-apps/api/process';
import { preventDefault, registerListeners } from "../../utils";
import { open } from "@tauri-apps/api/shell";

export default function DropArea() {
  const [alwaysOnTopEnabled, setAlwaysOnTopEnabled] = useState<boolean>(false);
  const [windowFocused, setWindowFocused] = useState<boolean>();
  const [toolsEnabled, setToolsEnabled] = useState<boolean>(false);
  const [moveables, setMoveables] = useState<Moveable[]>([]);
  const dropAreaRef = useRef<HTMLDivElement>(null);
  const { show, hideAll } = useContextMenu({ id: 'menu' });

  useEffect(listenToWindowFocus, []);
  useLayoutEffect(loadLayout, []);

  function listenToWindowFocus() {
    appWindow.isFocused().then(focused => setWindowFocused(focused));
    return registerListeners(
      appWindow.onFocusChanged(({ payload: focused }) => setWindowFocused(focused))
    );
  }

  function createDropElement(event: React.DragEvent<HTMLElement>) {
    preventDefault(event);
    const files = event.dataTransfer.files;
    const dropArea = dropAreaRef.current as HTMLElement;
    for (let i = 0; i < files.length; i++) {
      if (files[i].type.startsWith("image")) {
        getImagePath(files[i]).then(path => {
          const img = document.createElement("img");
          img.style.top = event.clientY - 25 + 'px';
          img.style.left = event.clientX - 25 + 'px';
          img.src = convertFileSrc(path);
          img.classList.add("droppedElement");
          dropArea.appendChild(img);
          makeElementMovable(img);
        });
      }
    }
  }

  function makeElementMovable(element: HTMLElement) {
    element.classList.add("moveable");
    element.removeAttribute("data-tauri-drag-region");
    const moveable = new Moveable(dropAreaRef.current as HTMLElement, {
      target: element,
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
    }).on("drag", e => e.target.style.transform = e.transform)
      .on("scale", e => e.target.style.transform = e.drag.transform)
      .on("rotate", e => e.target.style.transform = e.drag.transform);
    setMoveables(prevMovables => [...prevMovables, moveable]);
    setToolsEnabled(true);
  }

  function removeMoveables() {
    moveables.forEach(moveable => {
      const element = moveable.getTargets()[0];
      element.classList.remove("moveable");
      element.setAttribute("data-tauri-drag-region", "true");
      moveable.destroy();
    });
    setMoveables([]);
    setToolsEnabled(false);
  }

  function addMovables() {
    document.querySelectorAll(".droppedElement:not(.moveable)")
      .forEach(element => makeElementMovable(element as HTMLElement));
  }

  function toggleTools(toggle: boolean) {
    if (toggle) {
      addMovables();
    } else {
      removeMoveables();
    }
  }

  function toggleAlwaysOnTop(toggle: boolean) {
    appWindow.setAlwaysOnTop(toggle).then(_ => setAlwaysOnTopEnabled(toggle));
  }

  function createConfigDir(path: string = ''): Promise<void> {
    return createDir(`./${path}`, { dir: BaseDirectory.AppConfig, recursive: true });
  }

  function removeConfigDir(path: string = ''): Promise<void> {
    return removeDir(`./${path}`, { dir: BaseDirectory.AppConfig, recursive: true });
  }

  function getConfigPath(pathPart: string): Promise<string> {
    return appConfigDir().then(path => `${path}${pathPart}`);
  }

  function getImagePath(file: File): Promise<string> {
    return createConfigDir('layout\\images')
      .then(_ => file.arrayBuffer())
      .then(bytes => writeBinaryFile(`layout\\images\\${file.name}`, bytes, { dir: BaseDirectory.AppData }))
      .then(_ => getConfigPath(`layout\\images\\${file.name}`));
  }

  function editLayout() {
    toggleTools(true);
  }

  function saveLayout() {
    toggleTools(false);
    const dropArea = dropAreaRef.current as HTMLElement;
    const content = dropArea.innerHTML.toString();
    createConfigDir("layout")
      .then(_ => writeTextFile('layout\\dropArea.html', content, { dir: BaseDirectory.AppConfig }));
  }

  function loadLayout() {
    createConfigDir("layout")
      .then(_ => exists('layout\\dropArea.html', { dir: BaseDirectory.AppConfig }))
      .then(fileExists => fileExists ? readTextFile('layout\\dropArea.html', { dir: BaseDirectory.AppConfig }) : '')
      .then(innerHTML => {
        const container = dropAreaRef.current as HTMLElement;
        container.innerHTML = innerHTML;
      });
  }

  function deleteLayout() {
    removeConfigDir("layout").then(_ => reload())
  }

  function reload() {
    toggleAlwaysOnTop(false);
    window.location.reload();
  }

  function close() {
    exit(1);
  }

  function openInfo() {
    resourceDir().then(dir => {
      open(dir + "skins\\README.txt")
      open(dir + "skins")
    });
  }

  function openSupportLink() {
    open("https://ko-fi.com/gpiskas");
  }

  function noDroppedElement() {
    return document.querySelectorAll(".droppedElement").length == 0;
  }

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
      <div onContextMenu={event => event.preventDefault()}>
        <Menu id="menu">
          <Item onClick={openInfo}>Info & Customization<RightSlot>🎬</RightSlot></Item>
          <Item onClick={openSupportLink}>Support the developer<RightSlot>❤️</RightSlot></Item>
          <Separator></Separator>
          <Item disabled={noDroppedElement} onClick={editLayout}>Edit layout<RightSlot>🔧</RightSlot></Item>
          <Item disabled={noDroppedElement} onClick={saveLayout}>Save layout<RightSlot>📸</RightSlot></Item>
          <Item disabled={noDroppedElement} onClick={loadLayout}>Load layout<RightSlot>🖼️</RightSlot></Item>
          <Item disabled={noDroppedElement} onClick={deleteLayout}>Delete layout<RightSlot>🗑️</RightSlot></Item>
          <Separator></Separator>
          <Item onClick={_ => toggleAlwaysOnTop(!alwaysOnTopEnabled)}>{alwaysOnTopEnabled ? 'Disable' : 'Enable'} always on top<RightSlot>📌</RightSlot></Item>
          <Item onClick={reload}>Reload<RightSlot>🔄</RightSlot></Item>
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