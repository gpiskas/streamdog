import React, { useEffect, useState } from 'react';
import { UnlistenFn, listen } from '@tauri-apps/api/event'
import { invoke } from '@tauri-apps/api/tauri';
import "./App.css";
import Mouse from './Mouse/Mouse';

function App() {
  const [displaySize, setDisplaySize] = useState<number[]>([0, 0]);
  const [mouseMove, setMouseMove] = useState<number[]>([0, 0]);
  const [keyPressKey, setKeyPressKey] = useState('');
  const [keyPress, setKeyPress] = useState(false);
  const [buttonPress, setButtonPress] = useState(false);

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

  return (
    <div className="container" data-tauri-drag-region>
      <div className="canvas">
        <Mouse displaySize={displaySize}>
        </Mouse>
      </div>
    </div>
  );
}

export default App;

