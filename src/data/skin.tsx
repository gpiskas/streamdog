import { resolveResource } from "@tauri-apps/api/path";
import { convertFileSrc } from "@tauri-apps/api/tauri";
import { GlobalContextData } from "../components/GlobalContext";
import { BaseDirectory, exists } from "@tauri-apps/api/fs";
import { watch } from "tauri-plugin-fs-watch-api";

export function loadSkin(context: GlobalContextData): Promise<void> {
    const skin = context.userSettings.skin;
    return Promise.all([
        resolve(`skins/${skin}/background.png`),
        resolve(`skins/${skin}/mouse.png`),
        resolve(`skins/${skin}/mouseArm.png`),
        resolve(`skins/${skin}/keyboardArm.png`),
    ]).then(res => {
        console.log("Skin loaded", skin);
        watchSkinFiles(res);
        const sheet = document.styleSheets[document.styleSheets.length - 1];
        sheet.insertRule(`#background { background-image: url(${convertFileSrc(res[0])}) }`, 0);
        sheet.insertRule(`#mouseDevice { background-image:  url(${convertFileSrc(res[1])}) }`, 0);
        sheet.insertRule(`#mouseArm { background-image: url(${convertFileSrc(res[2])}) }`, 0);
        sheet.insertRule(`#keyboardArm { background-image:  url(${convertFileSrc(res[3])}) }`, 0);
    }).catch((err: Error) => {
        context.errorMessage = err.message;
    });
}

function resolve(path: string): Promise<string> {
    return exists(path, { dir: BaseDirectory.Resource })
        .then(fileExists => {
            if (fileExists) {
                return resolveResource(path);
            }
            throw new Error("Missing skin part!\n" + path);
        });
}

function watchSkinFiles(files: string[]) {
    console.log("Listening for skin file changes");
    watch(files, _ => {
        console.log("Skin changed, reloading");
        window.location.reload();
    }, { delayMs: 1000 });
}