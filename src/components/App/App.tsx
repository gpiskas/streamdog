import React, { useEffect, useRef, useState } from 'react';
import { UnlistenFn, listen } from '@tauri-apps/api/event'
import { invoke } from '@tauri-apps/api/tauri';
import "./App.css";

function App() {
  const [displaySize, setDisplaySize] = useState<number[]>([0, 0]);
  const [keyPressKey, setKeyPressKey] = useState('');
  const [keyPress, setKeyPress] = useState(false);
  const [buttonPress, setButtonPress] = useState(false);
  const mousepadRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getDisplaySize();
    const listenersPromise = registerListeners();
    return () => {
      unregisterListeners(listenersPromise);
    }
  }, []);

  function getDisplaySize() {
    invoke('get_display_size').then(response => {
      console.log("get_display_size", response);
      setDisplaySize(response as number[])
    });
  }

  async function registerListeners(): Promise<UnlistenFn[]> {
    console.log("registering listener");
    return [
      await listen('MouseMove', event => handleMouseMove(event.payload as number[])),
      await listen('ButtonPress', _ => handleButtonPress(true)),
      await listen('ButtonRelease', _ => handleButtonPress(false)),
      await listen('KeyPress', event => {
        console.log("KeyPress", event.payload);
        setKeyPressKey(event.payload as string);
        setKeyPress(true);
      }),
      await listen('KeyRelease', _ => {
        setKeyPressKey('');
        setKeyPress(false);
      })
    ];
  }

  function unregisterListeners(listenersPromise: Promise<UnlistenFn[]>) {
    console.log("unregistering listeners");
    listenersPromise.then(listeners => listeners.forEach(listener => listener()));
  }

  function handleMouseMove(mousePosition: number[]) {
    if (mousepadRef.current && mouseRef.current) {
      const [mouseX, mouseY] = mousePosition;
      const [displayWidth, displayHeight] = displaySize;
      const mouseWidthPercent = mouseX / displayWidth;
      const mouseHeightPercent = mouseY / displayHeight;

      const mousepad = mousepadRef.current;
      const mousepadWidth = mousepad.clientWidth as number;
      const mousepadHeight = mousepad.clientHeight as number;

      const mouse = mouseRef.current;
      mouse.style.left = mouseWidthPercent * mousepadWidth + "px";
      mouse.style.top = mouseHeightPercent * mousepadHeight + "px";
    }
  }

  function handleButtonPress(pressed: boolean) {
    if (mouseRef.current) {
      if (pressed) {
        mouseRef.current.style.background = '#FFFFFF'
      } else {
        mouseRef.current.style.background = '#000000'
      }
    }
  }

  return (
    <div id="container" data-tauri-drag-region>
      <div id="background" data-tauri-drag-region>
        <div id="mousepad" ref={mousepadRef} data-tauri-drag-region>
          <div id="mouse" ref={mouseRef} data-tauri-drag-region>
          </div>
        </div>
        <div id="keyboard" data-tauri-drag-region>

        </div>
        <div id="armMouse" data-tauri-drag-region>
          AM
        </div>
        <div id="armKeyboard" data-tauri-drag-region>
          AK
        </div>
      </div>
    </div>
  );
}

export default App;


