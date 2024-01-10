import React, { useRef, useState } from 'react';
import Moveable from "moveable";
import { Item, Menu, useContextMenu } from 'react-contexify';
import 'react-contexify/ReactContexify.css';
import "./DropArea.css";

export default function DropArea() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [moveables, setMoveables] = useState<Moveable[]>([]);
  const { show } = useContextMenu({ id: 'menu' });

  function onDragOver(event: React.SyntheticEvent): void {
    event.stopPropagation();
    event.preventDefault();
  }

  function onDrop(event: React.DragEvent<HTMLElement>): void {
    event.stopPropagation();
    event.preventDefault();
    const dropElement = createDropElement(event);
    makeElementsMovable(dropElement);
  }

  function createDropElement(event: React.DragEvent<HTMLElement>): HTMLElement {
    var img = document.createElement("img");
    img.style.top = event.clientY - 25 + 'px';
    img.style.left = event.clientX - 25 + 'px';
    img.src = window.URL.createObjectURL(event.dataTransfer.files[0]);
    img.classList.add("droppedElement");
    containerRef.current?.appendChild(img);
    return img;
  }

  function makeElementsMovable(element: HTMLElement) {
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
      moveable.getTargets()[0].classList.remove("moveable");
      moveable.destroy();
    });
    setMoveables([]);
  }

  function addMovables() {
    document.querySelectorAll(".droppedElement:not(.moveable)")
      .forEach(element => makeElementsMovable(element as HTMLElement));
  }

  function reset() {
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
          <Item id="hide" onClick={removeMoveables}>Hide tools</Item>
          <Item id="show" onClick={addMovables}>Show tools</Item>
          <Item id="reset" onClick={reset}>Reset</Item>
        </Menu>
      </div>
    </div>
  );
}