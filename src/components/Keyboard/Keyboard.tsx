import React, { useLayoutEffect, useRef } from 'react';
import "./Keyboard.css";

interface Props {
  keyPress: KeyPress | null
}

export default function Keyboard(props: Props) {
  const popupContainerRef = useRef<HTMLDivElement>(null);
  const armRef = useRef<HTMLDivElement>(null);
  const armPivotRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (popupContainerRef.current
      && armRef.current
      && armPivotRef.current) {
      onKeyPress(popupContainerRef.current, armRef.current, armPivotRef.current)
    }
  }, [props])

  function onKeyPress(popupContainer: HTMLDivElement, arm: HTMLDivElement, armPivot: HTMLDivElement) {
    const containerHeight = popupContainer.clientHeight as number;
    const containerWidth = popupContainer.clientWidth as number;

    if (props.keyPress) {
      var popup = document.createElement("div");
      popup.style.top = Math.random() * containerHeight + 'px';
      popup.style.left = Math.random() * containerWidth + 'px';
      popup.className = "popup";
      popup.innerText = props.keyPress.key;
      popupContainer.appendChild(popup);
      setTimeout(() => {
        popup.remove();
      }, 500);

      const popupRect = popup.getBoundingClientRect();
      const popupLeft = popupRect.left;
      const popupTop = popupRect.top;

      const armPivotRect = armPivot.getBoundingClientRect();
      const armLeft = armPivotRect.left;
      const armTop = armPivotRect.top;

      const leftDiff = popupLeft - armLeft;
      const topDiff = popupTop - armTop;

      const angle = -Math.atan2(leftDiff, topDiff);
      const distance = Math.sqrt(Math.pow(leftDiff, 2) + Math.pow(topDiff, 2)) + 10;
      arm.style.transform = `rotate(${angle}rad)`;
      arm.style.height = distance + "px";
    } else {
      arm.style.transform = 'rotate(20deg)';
      arm.style.height = '100px'
    }
  }

  return (
    <div className="container" data-tauri-drag-region>
      <div id="keyboard" data-tauri-drag-region>
        <div id="popupContainer" ref={popupContainerRef} data-tauri-drag-region></div>
      </div>
      <div id="keyboardArm" ref={armRef} data-tauri-drag-region>
        <div id="keyboardArmPivot" ref={armPivotRef} data-tauri-drag-region></div>
      </div>
    </div>
  );
}

