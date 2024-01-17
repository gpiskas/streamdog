import "./App.css";
import Mouse from '../Mouse/Mouse';
import Keyboard from '../Keyboard/Keyboard';
import DropArea from '../DropArea/DropArea';
import Menu from "../Menu/Menu";

export default function App() {
  console.debug('Rendering', App.name);
  return (
    <div id="app"
      className="container"
      data-tauri-drag-region>
      <div id="background"
        className="container"
        data-tauri-drag-region />
      <Mouse />
      <Keyboard />
      <DropArea />
      <Menu />
    </div>
  );
}
