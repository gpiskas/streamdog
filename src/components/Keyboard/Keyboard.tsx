import React, { useEffect, useRef } from 'react';
import "./Keyboard.css";

interface Props {
  keyPress: KeyPress | null
}

function Keyboard(props: Props) {
  const popupContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (popupContainerRef.current && props.keyPress) {
      spawnKeyPressPopup(popupContainerRef.current, props.keyPress.key)
    }
  }, [popupContainerRef, props.keyPress])

  function spawnKeyPressPopup(popupContainer: HTMLDivElement, keyPress: string) {
    const containerWidth = popupContainer.clientWidth as number;
    const containerHeight = popupContainer.clientHeight as number;
    var popup = document.createElement("div");
    popup.style.top = Math.random() * containerHeight + 'px';
    popup.style.left = Math.random() * containerWidth + 'px';
    popup.className = "popup";
    popup.innerText = keyPress;
    popupContainer.appendChild(popup);
    setTimeout(() => {
      popup.remove();
    }, 500);
  }

  return (
    <div id="keyboard" data-tauri-drag-region>
      <div id="popupContainer" ref={popupContainerRef}></div>
    </div>
  );
}

export default Keyboard;

