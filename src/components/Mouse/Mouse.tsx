import "./Mouse.css";
import { useContext, useEffect, useRef } from 'react';
import { listen } from '@tauri-apps/api/event';
import { getDistance, getRadAngle, getRectDistance, registerListeners } from '../../utils';
import { GlobalContext } from "../GlobalContextProvider/GlobalContext";

export default function Mouse() {
  const context = useContext(GlobalContext);
  const mousepadRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef<HTMLDivElement>(null);
  const mouseDeviceRef = useRef<HTMLDivElement>(null);
  const armRef = useRef<HTMLDivElement>(null);
  const armPivotRef = useRef<HTMLDivElement>(null);

  useEffect(listenToMouseEvents, []);

  function listenToMouseEvents() {
    initializePosition();
    return registerListeners(Mouse.name,
      listen('MouseMove', event => onMouseMove(event.payload as number[])),
      listen('ButtonPress', _ => onButtonPress(true)),
      listen('ButtonRelease', _ => onButtonPress(false)),
    );
  }

  function initializePosition() {
    const [displayWidth, displayHeight] = context.app.displaySize;
    onMouseMove([displayWidth / 2, displayHeight / 2]);
  }

  function onMouseMove(mousePosition: number[]) {
    calculateMouseMovement(mousePosition);
    calculateArmMovement();
  }

  function calculateMouseMovement(mousePosition: number[]) {
    const [mouseX, mouseY] = mousePosition;
    const [displayWidth, displayHeight] = context.app.displaySize;
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
  }

  function calculateArmMovement() {
    const [left, top] = getRectDistance(mouseRef.current as HTMLElement, armPivotRef.current as HTMLElement);
    const angle = -getRadAngle(left, top);
    const distance = getDistance(left, top) + 10;
    const arm = armRef.current as HTMLDivElement;
    arm.style.transform = `rotate(${angle}rad)`;
    arm.style.height = distance + "px";
  }

  function onButtonPress(buttonPress: boolean) {
    const mouseDevice = mouseDeviceRef.current as HTMLDivElement;
    mouseDevice.style.filter = buttonPress ? 'brightness(0.5)' : 'brightness(1)';

    const arm = armRef.current as HTMLDivElement;
    const [left, top] = getRectDistance(mouseRef.current as HTMLElement, armPivotRef.current as HTMLElement);
    const distance = getDistance(left, top) + 10 + (buttonPress ? 5 : 0);
    arm.style.height = distance + "px";
  }

  console.debug('Rendering', Mouse.name);
  return (
    <div id="mouseContainer" className="container" data-tauri-drag-region>
      <div id="mousepad" ref={mousepadRef} data-tauri-drag-region>
        <div id="mouse" ref={mouseRef}>
          <div id="mouseDevice" ref={mouseDeviceRef} data-tauri-drag-region></div>
        </div>
      </div>
      <div id="mouseArm" ref={armRef} data-tauri-drag-region>
        <div id="mouseArmPivot" ref={armPivotRef}></div>
      </div>
    </div>
  );
}