import React, { useRef, useState } from 'react';
import Moveable from "moveable";
import { Item, Menu, Separator, RightSlot, useContextMenu } from 'react-contexify';
import 'react-contexify/ReactContexify.css';
import "./DropArea.css";
import { appWindow } from '@tauri-apps/api/window';
import { BaseDirectory, createDir, readTextFile, writeBinaryFile, writeTextFile } from "@tauri-apps/api/fs";
import { appConfigDir } from '@tauri-apps/api/path';
import { convertFileSrc } from '@tauri-apps/api/tauri';

export default function DropArea() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [moveables, setMoveables] = useState<Moveable[]>([]);
  const [alwaysOnTopEnabled, setAlwaysOnTopEnabled] = useState<boolean>(false);
  const [toolsEnabled, setToolsEnabled] = useState<boolean>(true);
  const { show } = useContextMenu({ id: 'menu' });

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
        var img = document.createElement("img");
        img.style.top = event.clientY - 25 + 'px';
        img.style.left = event.clientX - 25 + 'px';
        getImagePath(files[i]).then(path => {
          console.log(convertFileSrc(path))
          img.src = convertFileSrc(path)
          img.classList.add("droppedElement");
          containerRef.current?.appendChild(img);
          // makeElementMovable(img);
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

  function toggleAlwaysOnTop() {
    appWindow.setAlwaysOnTop(!alwaysOnTopEnabled);
    setAlwaysOnTopEnabled(!alwaysOnTopEnabled);
  }

  function toggleTools() {
    if (!toolsEnabled) {
      addMovables();
    } else {
      removeMoveables();
    }
    setToolsEnabled(!toolsEnabled);
  }


  function createConfigPath(path: string = ''): Promise<void> {
    return createDir(`./${path}`, { dir: BaseDirectory.AppConfig, recursive: true });
  }

  function getConfigPath(pathPart: string): Promise<string> {
    return appConfigDir().then(path => `${path}${pathPart}`);
  }

  function getImagePath(file: File): Promise<string> {
    return createConfigPath('images')
      .then(_ => file.arrayBuffer())
      .then(bytes => writeBinaryFile(`images\\${file.name}`, bytes, { dir: BaseDirectory.AppData }))
      .then(_ => getConfigPath(`images\\${file.name}`));
  }


  async function saveConfig() {
    const config = {
      foo: 1,
      bar: 2
    };
    await writeTextFile('config.json', JSON.stringify(config), { dir: BaseDirectory.AppConfig });
  }

  async function loadConfig() {

  }



  function reset() {
    appWindow.setAlwaysOnTop(false);
    window.location.reload();
  }

  return (
    <div className="container"
      onContextMenu={event => show({ event })}
      ref={containerRef}
      onDragOver={onDragOver}
      onDrop={onDrop}
      data-tauri-drag-region>
      <div data-tauri-drag-region>
        <Menu id="menu">
          <Item id="hide" onClick={toggleTools}>{toolsEnabled ? 'Disable' : 'Enable'} image tools<RightSlot>🔧</RightSlot></Item>
          <Item id="reset" onClick={toggleAlwaysOnTop}>{alwaysOnTopEnabled ? 'Disable' : 'Enable'} always on top<RightSlot>📌</RightSlot></Item>
          <Separator></Separator>
          <Item id="reset" onClick={saveConfig}>Save layout<RightSlot>📸</RightSlot></Item>
          <Item id="reset" onClick={loadConfig}>Load layout<RightSlot>🖼️</RightSlot></Item>
          <Item id="reset" onClick={reset}>Reset<RightSlot>🗑️</RightSlot></Item>
        </Menu>
      </div>
    </div>
  );
}