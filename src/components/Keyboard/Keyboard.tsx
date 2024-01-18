import "./Keyboard.css";
import { useContext, useEffect, useRef } from 'react';
import { listen } from '@tauri-apps/api/event';
import { getDistance, getRadAngle, getRectDistance, registerListeners } from '../../utils';
import { getKeyPressCharacter } from './keymap';
import { GlobalContext } from "../GlobalContextProvider/GlobalContext";

export interface KeyPress {
  id: number
  key: string
  character: string
}

export default function Keyboard() {
  const context = useContext(GlobalContext);
  const popupContainerRef = useRef<HTMLDivElement>(null);
  const armRef = useRef<HTMLDivElement>(null);
  const armPivotRef = useRef<HTMLDivElement>(null);

  useEffect(listenToKeyboardEvents, []);

  function listenToKeyboardEvents() {
    return registerListeners(Keyboard.name,
      listen('KeyPress', event => {
        const payload = event.payload as string[];
        onKeyPress({ id: event.id, key: payload[0], character: payload[1] });
      }),
      listen('KeyRelease', _ => onKeyPress(null))
    );
  }

  function onKeyPress(keyPress: KeyPress | null) {
    const arm = armRef.current as HTMLDivElement;
    if (keyPress) {
      const popup = createPopup(keyPress);
      const [left, top] = getRectDistance(popup, armPivotRef.current as HTMLElement);
      const angle = -getRadAngle(left, top);
      const distance = getDistance(left, top) + 10;
      arm.style.transform = `rotate(${angle}rad)`;
      arm.style.height = distance + "px";
    } else {
      arm.style.transform = 'rotate(20deg)';
      arm.style.height = '100px';
    }
  }

  function createPopup(keyPress: KeyPress) {
    const keyData = getKeyPressCharacter(keyPress, context.settings.showKeystrokes);
    const container = popupContainerRef.current as HTMLDivElement;
    const containerHeight = container.clientHeight as number;
    const containerWidth = container.clientWidth as number;
    const popup = document.createElement("div");
    popup.style.top = keyData.position[0] * containerHeight + 'px';
    popup.style.left = keyData.position[1] * containerWidth + 'px';
    popup.className = "popup";
    popup.innerText = keyData.label;
    container.appendChild(popup);
    setTimeout(() => popup.remove(), 500);
    return popup;
  }

  console.debug('Rendering', Keyboard.name);
  return (
    <div id="keyboardContainer" className="container" data-tauri-drag-region>
      <div id="keyboard" data-tauri-drag-region>
        <div id="popupContainer" ref={popupContainerRef} data-tauri-drag-region></div>
      </div>
      <div id="keyboardArm" ref={armRef} data-tauri-drag-region>
        <div id="keyboardArmPivot" ref={armPivotRef}></div>
      </div>
    </div>
  );
}

