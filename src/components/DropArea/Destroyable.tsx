
import { Able, MoveableManagerInterface, Renderer } from "moveable";

export const Destroyable: Able = {
    name: "destroyable",
    render(moveable: MoveableManagerInterface<any, any>, React: Renderer) {
        const rect = moveable.getRect();
        const { pos2 } = moveable.state;
        return React.createElement("div", {
            className: "moveable-destroyable-button",
            onClick: () => moveable.triggerEvent("onWarpEnd", {}), // hijacked event!
            style: {
                transform: `translate(${pos2[0]}px, ${pos2[1]}px) rotate(${rect.rotation}deg) translate(5px, 5px)`
            }
        }, ["X"]);
    },
}