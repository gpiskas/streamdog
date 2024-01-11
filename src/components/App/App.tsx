import { useLayoutEffect, useState } from 'react';
import { UnlistenFn, listen } from '@tauri-apps/api/event'
import { invoke } from '@tauri-apps/api/tauri';
import "./App.css";
import Mouse from '../Mouse/Mouse';
import Keyboard from '../Keyboard/Keyboard';
import DropArea from '../DropArea/DropArea';

export default function App() {
  const [displaySize, setDisplaySize] = useState<number[]>([0, 0]);
  const [mousePosition, setMousePosition] = useState<number[]>([0, 0]);
  const [keyPress, setKeyPress] = useState<KeyPress | null>(null);
  const [buttonPress, setButtonPress] = useState<boolean>(false);

  useLayoutEffect(() => {
    getDisplaySize();
    const listenersPromise = registerListeners();
    return () => {
      unregisterListeners(listenersPromise);
    }
  }, []);

  function getDisplaySize() {
    invoke('get_display_size').then(response => {
      setDisplaySize(response as number[])
    });
  }

  async function registerListeners(): Promise<UnlistenFn[]> {
    return [
      await listen('MouseMove', event => setMousePosition(event.payload as number[])),
      await listen('ButtonPress', _ => setButtonPress(true)),
      await listen('ButtonRelease', _ => setButtonPress(false)),
      await listen('KeyPress', event => {
        const payload = event.payload as string[];
        setKeyPress({ id: event.id, key: payload[0], character: payload[1] });
      }),
      await listen('KeyRelease', _ => {
        setKeyPress(null);
      })
    ];
  }

  function unregisterListeners(listenersPromise: Promise<UnlistenFn[]>) {
    listenersPromise.then(listeners => listeners.forEach(listener => listener()));
  }

  return (
    <div className="container" data-tauri-drag-region>
      <div id="background" data-tauri-drag-region>
        <Mouse
          displaySize={displaySize}
          mousePosition={mousePosition}
          buttonPress={buttonPress}>
        </Mouse>
        <Keyboard keyPress={keyPress}></Keyboard>
        <DropArea></DropArea>
      </div>
    </div>
  );
}
