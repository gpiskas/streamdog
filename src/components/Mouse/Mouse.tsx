import "./Mouse.css";
import { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { GlobalContext } from '../GlobalContext';
import { listen } from '@tauri-apps/api/event';
import { getDistance, getRadAngle, getRectDistance, registerListeners } from '../../utils';

export default function Mouse() {
  const context = useContext(GlobalContext);
  const [mousePosition, setMousePosition] = useState<number[]>([0, 0]);
  const [buttonPress, setButtonPress] = useState<boolean>(false);
  const mousepadRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef<HTMLDivElement>(null);
  const mouseDeviceRef = useRef<HTMLDivElement>(null);
  const armRef = useRef<HTMLDivElement>(null);
  const armPivotRef = useRef<HTMLDivElement>(null);

  useEffect(listenToMouseEvents, []);
  useLayoutEffect(onMouseEvent, [mousePosition, buttonPress]);

  function listenToMouseEvents() {
    return registerListeners(
      listen('MouseMove', event => setMousePosition(event.payload as number[])),
      listen('ButtonPress', _ => setButtonPress(true)),
      listen('ButtonRelease', _ => setButtonPress(false)),
    );
  }

  function onMouseEvent() {
    calculateMouseMovement();
    calculateArmMovement();
  }

  function calculateMouseMovement() {
    const [mouseX, mouseY] = mousePosition;
    const [displayWidth, displayHeight] = context.displaySize;
    const mousepad = mousepadRef.current as HTMLDivElement;
    const mousepadWidth = mousepad.clientWidth as number;
    const mousepadHeight = mousepad.clientHeight as number;
    const leftOffset = mousepadWidth - (mouseX / displayWidth) * mousepadWidth;
    const topOffset = mousepadHeight - (mouseY / displayHeight) * mousepadHeight;
    const mouse = mouseRef.current as HTMLDivElement;
    mouse.style.left = leftOffset + "px";
    mouse.style.top = topOffset + "px";
    const mouseDevice = mouseDeviceRef.current as HTMLDivElement;
    const mouseDeviceAngle = -(leftOffset / mousepadWidth - 0.5) * 50;
    const mouseDeviceScale = (topOffset / mousepadHeight) * 0.1 + 0.9;
    mouseDevice.style.transform = `rotate(${mouseDeviceAngle}deg) scale(${mouseDeviceScale})`;
    mouseDevice.style.filter = buttonPress ? 'brightness(0.7)' : 'brightness(1)';
  }

  function calculateArmMovement() {
    const [left, top] = getRectDistance(mouseRef.current as HTMLElement, armPivotRef.current as HTMLElement);
    const angle = -getRadAngle(left, top);
    const distance = getDistance(left, top) + 15;
    const arm = armRef.current as HTMLDivElement;
    arm.style.transform = `rotate(${angle}rad)`;
    arm.style.height = distance + "px";
  }

  return (
    <div className="container" data-tauri-drag-region>
      <div id="mousepad" ref={mousepadRef} data-tauri-drag-region>
        <div id="mouse" ref={mouseRef} data-tauri-drag-region>
          <div id="mouseDevice" ref={mouseDeviceRef} data-tauri-drag-region></div>
        </div>
      </div>
      <div id="mouseArm" ref={armRef} data-tauri-drag-region>
        <div id="mouseArmPivot" ref={armPivotRef} data-tauri-drag-region></div>
      </div>
    </div>
  );
}