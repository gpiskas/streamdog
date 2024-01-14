import { resolveResource } from "@tauri-apps/api/path";
import { convertFileSrc } from "@tauri-apps/api/tauri";
import { GlobalContextData } from "../components/GlobalContext";

export function loadSkin(context: GlobalContextData): Promise<void> {
    const skin = context.userSettings.selectedSkin;
    return Promise.all([
        resolve(`skins/${skin}/background.png`),
        resolve(`skins/${skin}/mouse.png`),
        resolve(`skins/${skin}/mouseArm.png`),
        resolve(`skins/${skin}/keyboardArm.png`),
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