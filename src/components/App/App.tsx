import React, { useEffect, useRef, useState } from 'react';
import { UnlistenFn, listen } from '@tauri-apps/api/event'
import { invoke } from '@tauri-apps/api/tauri';
import "./App.css";

function App() {
  const [displaySize, setDisplaySize] = useState<number[]>([0, 0]);
  const [mouseMove, setMouseMove] = useState<number[]>([0, 0]);
  const [keyPressKey, setKeyPressKey] = useState('');
  const [keyPress, setKeyPress] = useState(false);
  const [buttonPress, setButtonPress] = useState(false);
  const mousepadRef = useRef(null as null | HTMLDivElement);

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
      await listen('MouseMove', event => setMouseMove(event.payload as number[])),
      await listen('ButtonPress', _ => setButtonPress(true)),
      await listen('ButtonRelease', _ => setButtonPress(false)),
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


  function getMousePositionStyle(): React.CSSProperties {
    const [mouseX, mouseY] = mouseMove;
    const [displayWidth, displayHeight] = displaySize;
    const mouseWidthPercent = mouseX/displayWidth;
    const mouseHeightPercent = mouseY/displayHeight;
    const mousepadWidth = mousepadRef.current?.clientWidth as number;
    const mousepadHeight = mousepadRef.current?.clientHeight as number;
    return {
      left: mouseWidthPercent * mousepadWidth,
      top: mouseHeightPercent * mousepadHeight,
    };
  }

  return (
    <div id="container" data-tauri-drag-region>
      <div id="background" data-tauri-drag-region>
        <div id="mousepad" ref={mousepadRef} data-tauri-drag-region>
          <div id="mouse" style={getMousePositionStyle()} data-tauri-drag-region>
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

