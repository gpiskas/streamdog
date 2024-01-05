import React, { useEffect, useState } from 'react';
import { UnlistenFn, listen } from '@tauri-apps/api/event'
import "./App.css";

function App() {
  const [mouseMove, setMouseMove] = useState<number[]>([]);
  const [keyPress, setKeyPress] = useState(false);
  const [buttonPress, setButtonPress] = useState(false);

  useEffect(() => {
    const listenersPromise = registerListeners();
    return () => {
      unregisterListeners(listenersPromise);
    }
  }, []);

  async function registerListeners(): Promise<UnlistenFn[]> {
    console.log("registering listener");
    return [
      await listen('MouseMove', (event) => {
        setMouseMove(event.payload as number[]);
      }),
      await listen('KeyPress', (event) => {
        setKeyPress(true);
      }),
      await listen('KeyRelease', (event) => {
        setKeyPress(false);
      }),
      await listen('ButtonPress', (event) => {
        setButtonPress(true);
      }),
      await listen('ButtonRelease', (event) => {
        setButtonPress(false);
      })
    ];
  }

  function unregisterListeners(listenersPromise: Promise<UnlistenFn[]>) {
    console.log("unregistering listeners");
    listenersPromise.then(listeners => listeners.forEach(listener => listener()));
  }

  return (
    <div className="container" data-tauri-drag-region>
      <div>Mouse: {mouseMove[0]}, {mouseMove[1]}</div>
      <div>Key: {keyPress ? 1 : 0}</div>
      <div>Button: {buttonPress ? 1 : 0}</div>
    </div>
  );
}

export default App;

