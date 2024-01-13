import { useEffect, useState } from 'react';
import { UnlistenFn, listen } from '@tauri-apps/api/event'
import "./App.css";
import Mouse from '../Mouse/Mouse';
import Keyboard from '../Keyboard/Keyboard';
import DropArea from '../DropArea/DropArea';

export default function App() {
  const [mousePosition, setMousePosition] = useState<number[]>([0, 0]);
  const [buttonPress, setButtonPress] = useState<boolean>(false);

  useEffect(() => {
    const listenersPromise = registerListeners();
    return () => {
      unregisterListeners(listenersPromise);
    }
  }, []);

  async function registerListeners(): Promise<UnlistenFn[]> {
    return [
      await listen('MouseMove', event => setMousePosition(event.payload as number[])),
      await listen('ButtonPress', _ => setButtonPress(true)),
      await listen('ButtonRelease', _ => setButtonPress(false)),
    ];
  }

  function unregisterListeners(listenersPromise: Promise<UnlistenFn[]>) {
    listenersPromise.then(listeners => listeners.forEach(listener => listener()));
  }

  return (
    <div className="container" data-tauri-drag-region>
      <div id="background" data-tauri-drag-region>
        <Mouse
          mousePosition={mousePosition}
          buttonPress={buttonPress}>
        </Mouse>
        <Keyboard></Keyboard>
        <DropArea></DropArea>
      </div>
    </div>
  );
}
