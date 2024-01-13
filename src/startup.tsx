import { resolveResource } from "@tauri-apps/api/path";
import { convertFileSrc, invoke } from "@tauri-apps/api/tauri";
import { GlobalContextData } from "./GlobalContext";

export function loadResources(): Promise<void> {
    return Promise.all([
        resolve("resources/background.png"),
        resolve("resources/mouse.png"),
        resolve("resources/mouseArm.png"),
        resolve("resources/keyboardArm.png"),
    ]).then(res => {
        const sheet = document.styleSheets[document.styleSheets.length - 1];
        sheet.insertRule(`#background { background-image: ${res[0]} }`, 0);
        sheet.insertRule(`#mouseDevice { background-image: ${res[1]} }`, 0);
        sheet.insertRule(`#mouseArm { background-image: ${res[2]} }`, 0);
        sheet.insertRule(`#keyboardArm { background-image: ${res[3]} }`, 0);
    });
}

function resolve(path: string): Promise<string> {
    return resolveResource(path).then(res => `url(${convertFileSrc(res)})`);
}

export function loadContextData(): Promise<GlobalContextData> {
    return Promise.all([
        invoke('get_display_size'),
    ]).then(res => {
        return {
            displaySize: res[0] as number[]
        } as GlobalContextData;
    });
}