import React, { useRef } from 'react';
import "./Mouse.css";

interface Props {
  displaySize: number[]
  mousePosition: number[]
  buttonPress: boolean
}

function Mouse(props: Props) {
  const mousepadRef = useRef<HTMLDivElement>(null);

  function getMouseStyle(): React.CSSProperties | undefined {
    if (mousepadRef.current) {
      const [mouseX, mouseY] = props.mousePosition;
      const [displayWidth, displayHeight] = props.displaySize;
      const mouseWidthPercent = mouseX / displayWidth;
      const mouseHeightPercent = mouseY / displayHeight;

      const mousepad = mousepadRef.current;
      const mousepadWidth = mousepad.clientWidth as number;
      const mousepadHeight = mousepad.clientHeight as number;

      // inverse view
      return {
        left: mousepadWidth - mouseWidthPercent * mousepadWidth + "px",
        top: mousepadHeight - mouseHeightPercent * mousepadHeight + "px",
        background: props.buttonPress ? 'black' : 'white',
      }
    }
  }

  return (
    <div id="mousepad" ref={mousepadRef} data-tauri-drag-region>
      <div id="mouse" style={getMouseStyle()} data-tauri-drag-region>
      </div>
    </div>
  );
}

export default Mouse;


