import "./App.css";
import Error from '../Error/Error';
import Mouse from '../Mouse/Mouse';
import Keyboard from '../Keyboard/Keyboard';
import DropArea from '../DropArea/DropArea';
import { useContext } from "react";
import { GlobalContext } from "../GlobalContextProvider/GlobalContextProvider";

export default function App() {
  const context = useContext(GlobalContext);

  return (
    <div className="container" data-tauri-drag-region>
      {context.errorMessage ? <Error message={context.errorMessage}></Error> :
        <>
          <div className="container" id="background" data-tauri-drag-region />
          <Mouse />
          <Keyboard />
          <DropArea />
        </>
      }
    </div>
  );
}
