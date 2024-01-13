import "./App.css";
import Mouse from '../Mouse/Mouse';
import Keyboard from '../Keyboard/Keyboard';
import DropArea from '../DropArea/DropArea';

export default function App() {
  return (
    <div className="container" data-tauri-drag-region>
      <div className="container" id="background" data-tauri-drag-region />
      <Mouse />
      <Keyboard />
      <DropArea />
    </div>
  );
}
