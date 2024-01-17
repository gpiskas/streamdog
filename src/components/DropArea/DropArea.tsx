import "./DropArea.css";
import 'react-contexify/ReactContexify.css';
import React, { useContext, useEffect, useLayoutEffect, useRef } from 'react';
import Moveable from "moveable";
import { preventDefault } from "../../utils";
import { GlobalContext } from "../GlobalContextProvider/GlobalContext";
import { Destroyable } from "./Destroyable";
import { readLayout, writeLayout } from "../GlobalContextProvider/layout";
import { appWindow } from "@tauri-apps/api/window";
import { useContextMenu } from "react-contexify";

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
    readLayout(context.settings.selectedSkin).then(layout => {
      if (layout) {
        const dropArea = dropAreaRef.current as HTMLElement;
        dropArea.innerHTML = layout;
        dropArea.querySelectorAll(".droppedElement")
          .forEach(element => makeElementMovable(element as HTMLElement));
      }
    });
  }

  function saveLayout() {
    const dropArea = dropAreaRef.current as HTMLElement;
    const content = Array.from(dropArea.querySelectorAll(".droppedElement"))
      .reduce((html, node) => html + node.outerHTML, '');
    writeLayout(context.settings.selectedSkin, content);
  }


  function toggleMoveables(enabled: boolean) {
    const dropArea = dropAreaRef.current as HTMLElement;
    dropArea.querySelectorAll(".moveable-control-box")
      .forEach(element => {
        const x = element as HTMLElement;
        x.style.visibility = enabled ? 'visible' : 'hidden';
      });
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

  console.debug('Rendering', DropArea.name);
  return (
    <div id="dropArea"
      className="container"
      ref={dropAreaRef}
      onContextMenu={event => show({ event })}
      onMouseDown={hideAll}
      onDragOver={preventDefault}
      onDrop={createDropElement}
      data-tauri-drag-region>
    </div>
  );
}