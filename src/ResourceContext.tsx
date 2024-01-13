import { resolveResource } from "@tauri-apps/api/path";
import { convertFileSrc } from "@tauri-apps/api/tauri";

export function loadResources(): Promise<void> {
    return Promise.all([
        resolve("resources/background.png"),
        resolve("resources/mouse.png"),
        resolve("resources/arm.png"),
    ]).then(res => {
        var sheet = document.styleSheets[document.styleSheets.length - 1];
        sheet.insertRule(`#background { background-image: ${res[0]} }`, 0);
        sheet.insertRule(`#mouseDevice { background-image: ${res[1]} }`, 0);
        sheet.insertRule(`#mouseArm { background-image: ${res[2]} }`, 0);
        sheet.insertRule(`#keyboardArm { background-image: ${res[2]} }`, 0);
    });
}

function resolve(path: string): Promise<string> {
    return resolveResource(path).then(res => `url(${convertFileSrc(res)})`);
}