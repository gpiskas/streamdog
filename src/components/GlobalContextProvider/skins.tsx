import { UnlistenFn } from "@tauri-apps/api/event";
import { exists, BaseDirectory } from "@tauri-apps/api/fs";
import { resolveResource } from "@tauri-apps/api/path";
import { convertFileSrc } from "@tauri-apps/api/tauri";
import { watch } from "tauri-plugin-fs-watch-api";
import { GlobalContextData } from "./context";


export function loadAndWatchSkinFiles(context: GlobalContextData): Promise<UnlistenFn> {
    return loadSkin(context)
        .then(files => watchSkinFiles(files))
        .catch((err: Error) => {
            context.errorMessage = err.message;
            return () => { };
        });
}

function loadSkin(context: GlobalContextData): Promise<string[]> {
    const skin = context.settings.skin;
    return Promise.all([
        resolve(`skins/${skin}/background.png`),
        resolve(`skins/${skin}/mouse.png`),
        resolve(`skins/${skin}/mouseArm.png`),
        resolve(`skins/${skin}/keyboardArm.png`),
    ]).then(files => {
        console.log("Skin loaded", skin);
        const sheet = document.styleSheets[document.styleSheets.length - 1];
        sheet.insertRule(`#background { background-image: url(${convertFileSrc(files[0])}) }`, 0);
        sheet.insertRule(`#mouseDevice { background-image:  url(${convertFileSrc(files[1])}) }`, 0);
        sheet.insertRule(`#mouseArm { background-image: url(${convertFileSrc(files[2])}) }`, 0);
        sheet.insertRule(`#keyboardArm { background-image:  url(${convertFileSrc(files[3])}) }`, 0);
        return files;
    });
}

function resolve(path: string): Promise<string> {
    return exists(path, { dir: BaseDirectory.Resource }).then(fileExists => {
        if (fileExists) {
            return resolveResource(path);
        }
        throw new Error("Missing skin part!\n" + path);
    });
}

function watchSkinFiles(files: string[]): Promise<UnlistenFn> {
    console.log("Listening for skin file changes");
    return watch(files, _ => {
        console.log("Skin changed, reloading");
        window.location.reload();
    }, { delayMs: 1000 });
}