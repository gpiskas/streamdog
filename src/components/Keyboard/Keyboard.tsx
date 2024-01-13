import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import "./Keyboard.css";
import { UnlistenFn, listen } from '@tauri-apps/api/event';
import { unregisterListeners } from '../../utils';

interface KeyPress {
  id: number
  key: string
  character: string
  previous: KeyPress | null
}

export default function Keyboard() {
  const [keyPress, setKeyPress] = useState<KeyPress | null>(null);

  const popupContainerRef = useRef<HTMLDivElement>();
  const armRef = useRef<HTMLDivElement>();
  const armPivotRef = useRef<HTMLDivElement>();

  useEffect(() => {
    const listenersPromise = registerListeners();
    return () => {
      unregisterListeners(listenersPromise)
    }
  }, []);

  async function registerListeners(): Promise<UnlistenFn[]> {
    return [
      await listen('KeyPress', event => {
        const payload = event.payload as string[];
        setKeyPress(previous => ({ id: event.id, key: payload[0], character: payload[1], previous: previous }))
      }),
      await listen('KeyRelease', _ => {
        setKeyPress(null);
      })
    ];
  }

  useLayoutEffect(() => {
    //@ts-ignore
    onKeyPress(popupContainerRef.current, armRef.current, armPivotRef.current);
  }, [keyPress]);

  function onKeyPress(popupContainer: HTMLDivElement, arm: HTMLDivElement, armPivot: HTMLDivElement) {
    const containerHeight = popupContainer.clientHeight as number;
    const containerWidth = popupContainer.clientWidth as number;

    if (keyPress && keyPress.previous?.key != keyPress.key) {
      var popup = document.createElement("div");
      popup.style.top = Math.random() * containerHeight + 'px';
      popup.style.left = Math.random() * containerWidth + 'px';
      popup.className = "popup";
      popup.innerText = getKeyPressCharacter(keyPress);
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

  function getKeyPressCharacter(keyPress: KeyPress) {
    if (keyPress.character.length == 1) {
      return keyPress.character;
    }
    switch (keyPress.key) {
      //       /// Alt key on Linux and Windows (option key on macOS)
      // Alt,
      // AltGr,
      // Backspace,
      // CapsLock,
      // ControlLeft,
      // ControlRight,
      // Delete,
      // DownArrow,
      // End,
      // Escape,
      // F1,
      // F10,
      // F11,
      // F12,
      // F2,
      // F3,
      // F4,
      // F5,
      // F6,
      // F7,
      // F8,
      // F9,
      // Home,
      // LeftArrow,
      // /// also known as "windows", "super", and "command"
      // MetaLeft,
      // /// also known as "windows", "super", and "command"
      // MetaRight,
      // PageDown,
      // PageUp,
      // Return,
      // RightArrow,
      // ShiftLeft,
      // ShiftRight,
      // Space,
      // Tab,
      // UpArrow,
      // PrintScreen,
      // ScrollLock,
      // Pause,
      // NumLock,
      // BackQuote,
      // Num1,
      // Num2,
      // Num3,
      // Num4,
      // Num5,
      // Num6,
      // Num7,
      // Num8,
      // Num9,
      // Num0,
      // Minus,
      // Equal,
      // KeyQ,
      // KeyW,
      // KeyE,
      // KeyR,
      // KeyT,
      // KeyY,
      // KeyU,
      // KeyI,
      // KeyO,
      // KeyP,
      // LeftBracket,
      // RightBracket,
      // KeyA,
      // KeyS,
      // KeyD,
      // KeyF,
      // KeyG,
      // KeyH,
      // KeyJ,
      // KeyK,
      // KeyL,
      // SemiColon,
      // Quote,
      // BackSlash,
      // IntlBackslash,
      // KeyZ,
      // KeyX,
      // KeyC,
      // KeyV,
      // KeyB,
      // KeyN,
      // KeyM,
      // Comma,
      // Dot,
      // Slash,
      // Insert,
      // KpReturn,
      // KpMinus,
      // KpPlus,
      // KpMultiply,
      // KpDivide,
      // Kp0,
      // Kp1,
      // Kp2,
      // Kp3,
      // Kp4,
      // Kp5,
      // Kp6,
      // Kp7,
      // Kp8,
      // Kp9,
      // KpDelete,
      // Function,
      // Unknown(u32),
      // TODO handle characters
    }
    return '*';
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

