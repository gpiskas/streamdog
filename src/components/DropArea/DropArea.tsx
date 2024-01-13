import React, { useEffect, useRef, useState } from 'react';
import Moveable from "moveable";
import { Item, Menu, Separator, RightSlot, useContextMenu } from 'react-contexify';
import 'react-contexify/ReactContexify.css';
import "./DropArea.css";
import { appWindow } from '@tauri-apps/api/window';
import { BaseDirectory, createDir, readTextFile, removeDir, writeBinaryFile, writeTextFile } from "@tauri-apps/api/fs";
import { appConfigDir } from '@tauri-apps/api/path';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { exit } from '@tauri-apps/api/process';

export default function DropArea() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [moveables, setMoveables] = useState<Moveable[]>([]);
  const [alwaysOnTopEnabled, setAlwaysOnTopEnabled] = useState<boolean>(false);
  const [toolsEnabled, setToolsEnabled] = useState<boolean>(false);
  const { show } = useContextMenu({ id: 'menu' });

  useEffect(() => {
    loadLayout();
  }, []);

  function onDragOver(event: React.SyntheticEvent): void {
    event.stopPropagation();
    event.preventDefault();
  }

  function onDrop(event: React.DragEvent<HTMLElement>): void {
    event.stopPropagation();
    event.preventDefault();
    createDropElement(event);
  }

  function createDropElement(event: React.DragEvent<HTMLElement>) {
    const files = event.dataTransfer.files;
    for (let i = 0; i < files.length; i++) {
      if (files[i].type.startsWith("image")) {
        getImagePath(files[i]).then(path => {
          var img = document.createElement("img");
          img.style.top = event.clientY - 25 + 'px';
          img.style.left = event.clientX - 25 + 'px';
          img.src = convertFileSrc(path)
          img.classList.add("droppedElement");
          containerRef.current?.appendChild(img);
          makeElementMovable(img);
        });
      }
    }
  }

  function makeElementMovable(element: HTMLElement) {
    const moveable = new Moveable(containerRef.current as HTMLElement, {
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
    });
    moveable.on("drag", e => {
      e.target.style.transform = e.transform;
    });
    moveable.on("scale", e => {
      e.target.style.transform = e.drag.transform;
    });
    moveable.on("rotate", e => {
      e.target.style.transform = e.drag.transform;
    });
    setMoveables([...moveables, moveable]);
    moveables.push(moveable);
    element.classList.add("moveable");
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
  }

  function addMovables() {
    document.querySelectorAll(".droppedElement:not(.moveable)")
      .forEach(element => {
        element.removeAttribute("data-tauri-drag-region");
        makeElementMovable(element as HTMLElement)
      });
  }

  function toggleTools(toggle: boolean) {
    if (toggle) {
      addMovables();
    } else {
      removeMoveables();
    }
    setToolsEnabled(toggle);
  }

  function toggleAlwaysOnTop(toggle: boolean) {
    appWindow.setAlwaysOnTop(toggle)
      .then(_ => setAlwaysOnTopEnabled(toggle));
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
    return createConfigDir('images')
      .then(_ => file.arrayBuffer())
      .then(bytes => writeBinaryFile(`images\\${file.name}`, bytes, { dir: BaseDirectory.AppData }))
      .then(_ => getConfigPath(`images\\${file.name}`));
  }

  function saveLayout() {
    if (containerRef.current) {
      toggleTools(false);
      const content = containerRef.current.innerHTML.toString();
      createConfigDir()
        .then(_ => writeTextFile('dropArea.html', content, { dir: BaseDirectory.AppConfig }));
    }
  }

  function loadLayout() {
    createConfigDir()
      .then(_ => readTextFile('dropArea.html', { dir: BaseDirectory.AppConfig }).then(innerHTML => {
        if (containerRef.current) {
          containerRef.current.innerHTML = innerHTML;
        }
      }));
  }

  function deleteLayout() {
    removeConfigDir().then(_ => reload())
  }

  function reload() {
    toggleAlwaysOnTop(false);
    window.location.reload();
  }

  function close() {
    exit(1);
  }

  return (
    <div className="container">
      <div className="container"
        onContextMenu={event => show({ event })}
        ref={containerRef}
        onDragOver={onDragOver}
        onDrop={onDrop}
        data-tauri-drag-region>
      </div>
      <div data-tauri-drag-region onContextMenu={event => event.preventDefault()}>
        <Menu id="menu" >
          <Item onClick={_ => toggleTools(!toolsEnabled)}>{toolsEnabled ? 'Disable' : 'Enable'} image tools<RightSlot>🔧</RightSlot></Item>
          <Item onClick={_ => toggleAlwaysOnTop(!alwaysOnTopEnabled)}>{alwaysOnTopEnabled ? 'Disable' : 'Enable'} always on top<RightSlot>📌</RightSlot></Item>
          <Separator></Separator>
          <Item onClick={saveLayout}>Save layout<RightSlot>📸</RightSlot></Item>
          <Item onClick={loadLayout}>Load layout<RightSlot>🖼️</RightSlot></Item>
          <Item onClick={deleteLayout}>Delete layout<RightSlot>🗑️</RightSlot></Item>
          <Separator></Separator>
          <Item onClick={reload}>Reload<RightSlot>🔄</RightSlot></Item>
          <Item onClick={close}>Close<RightSlot>❌</RightSlot></Item>
        </Menu>
      </div>
    </div>
  );
}