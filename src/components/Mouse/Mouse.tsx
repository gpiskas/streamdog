import React, { useLayoutEffect, useRef } from 'react';
import "./Mouse.css";

interface Props {
  displaySize: number[]
  mousePosition: number[]
  buttonPress: boolean
}

export default function Mouse(props: Props) {
  const mousepadRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef<HTMLDivElement>(null);
  const armRef = useRef<HTMLDivElement>(null);
  const armPivotRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (mousepadRef.current && mouseRef.current && armRef.current && armPivotRef.current) {
      const mousepad = mousepadRef.current;
      const mouse = mouseRef.current;
      const armPivot = armPivotRef.current;
      const arm = armRef.current;
      calculateMouseMovement(mousepad, mouse);
      calculateArmMovement(mouse, armPivot, arm);
    }
  }, [props]);

  function calculateMouseMovement(mousepad: HTMLDivElement, mouse: HTMLDivElement) {
    const [mouseX, mouseY] = props.mousePosition;
    const [displayWidth, displayHeight] = props.displaySize;
    const mousepadWidth = mousepad.clientWidth as number;
    const mousepadHeight = mousepad.clientHeight as number;
    mouse.style.left = mousepadWidth - (mouseX / displayWidth) * mousepadWidth + "px"; // inverse view
    mouse.style.top = mousepadHeight - (mouseY / displayHeight) * mousepadHeight + "px"; // inverse view
    mouse.style.background = props.buttonPress ? 'grey' : 'white';
  }

  function calculateArmMovement(mouse: HTMLDivElement, armPivot: HTMLDivElement, arm: HTMLDivElement) {
    const mouseRect = mouse.getBoundingClientRect();
    const mouseLeft = mouseRect.left;
    const mouseTop = mouseRect.top;

    const armPivotRect = armPivot.getBoundingClientRect();
    const armLeft = armPivotRect.left;
    const armTop = armPivotRect.top;
    
    const leftDiff = mouseLeft - armLeft;
    const topDiff = mouseTop - armTop;

    const angle = -Math.atan2(leftDiff, topDiff);
    const distance = Math.sqrt(Math.pow(leftDiff, 2) + Math.pow(topDiff, 2));
    arm.style.transform = `rotate(${angle}rad)`;
    arm.style.height = distance + "px";
  }

  return (
    <div className="container" data-tauri-drag-region>
      <div id="mousepad" ref={mousepadRef} data-tauri-drag-region>
        <div id="mouse" ref={mouseRef} data-tauri-drag-region></div>
      </div>
      <div id="mouseArm" ref={armRef} data-tauri-drag-region>
        <div id="mousePivot" ref={armPivotRef} data-tauri-drag-region></div>
      </div>
    </div>
  );
}