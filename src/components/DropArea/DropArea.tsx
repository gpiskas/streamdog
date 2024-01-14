import "./DropArea.css";
import 'react-contexify/ReactContexify.css';
import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Moveable from "moveable";
import { Item, Menu, Separator, RightSlot, useContextMenu } from 'react-contexify';
import { appWindow } from '@tauri-apps/api/window';
import { BaseDirectory, createDir, exists, readTextFile, removeDir, writeBinaryFile, writeTextFile } from "@tauri-apps/api/fs";
import { resolveResource, resourceDir } from '@tauri-apps/api/path';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { exit } from '@tauri-apps/api/process';
import { preventDefault, registerListeners } from "../../utils";
import { open } from "@tauri-apps/api/shell";
import { GlobalContext } from "../GlobalContext";

export default function DropArea() {
  const context = useContext(GlobalContext);
  const [alwaysOnTopEnabled, setAlwaysOnTopEnabled] = useState<boolean>(false);
  const [windowFocused, setWindowFocused] = useState<boolean>();
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
        saveImage(files[i]).then(path => {
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
  }

  function removeMoveables() {
    moveables.forEach(moveable => {
      const element = moveable.getTargets()[0];
      element.classList.remove("moveable");
      element.setAttribute("data-tauri-drag-region", "true");
      moveable.destroy();
    });
    setMoveables([]);
  }

  function addMovables() {
    document.querySelectorAll(".droppedElement:not(.moveable)")
      .forEach(element => makeElementMovable(element as HTMLElement));
  }

  function toggleAlwaysOnTop(toggle: boolean) {
    // todo change user setting
    appWindow.setAlwaysOnTop(toggle).then(_ => setAlwaysOnTopEnabled(toggle));
  }

  function getLayoutDirPath(path: string = '') {
    return `skins/${context.userSettings.skin}/.layout/${path}`;
  }

  function getOrCreateLayoutDir(): Promise<void> {
    return createDir(getLayoutDirPath(), { dir: BaseDirectory.Resource, recursive: true });
  }

  function deleteLayoutDir(): Promise<void> {
    return removeDir(getLayoutDirPath(), { dir: BaseDirectory.Resource, recursive: true });
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

  function editLayout() {
    addMovables();
  }

  function saveLayout() {
    removeMoveables();
    const dropArea = dropAreaRef.current as HTMLElement;
    const content = dropArea.innerHTML.toString();
    getOrCreateLayoutDir()
      .then(_ => writeTextFile(getLayoutDirPath('layout'), content, { dir: BaseDirectory.Resource }));
  }

  function loadLayout() {
    const layoutFile = getLayoutDirPath('layout');
    getOrCreateLayoutDir()
      .then(_ => exists(layoutFile, { dir: BaseDirectory.Resource }))
      .then(fileExists => fileExists ? readTextFile(layoutFile, { dir: BaseDirectory.Resource }) : '')
      .then(innerHTML => {
        const container = dropAreaRef.current as HTMLElement;
        container.innerHTML = innerHTML;
      });
  }

  function deleteLayout() {
    deleteLayoutDir().then(_ => reload())
  }

  function reload() {
    toggleAlwaysOnTop(false);
    window.location.reload();
  }

  function close() {
    exit(1);
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