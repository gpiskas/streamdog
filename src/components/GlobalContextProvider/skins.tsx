import { UnlistenFn } from "@tauri-apps/api/event";
import { exists, BaseDirectory, readDir } from "@tauri-apps/api/fs";
import { resolveResource } from "@tauri-apps/api/path";
import { convertFileSrc } from "@tauri-apps/api/tauri";
import { watch } from "tauri-plugin-fs-watch-api";
import { GlobalContextData } from "./GlobalContext";

export function loadSkinData(context: GlobalContextData): Promise<UnlistenFn> {
    return loadSkinOptions(context).then(unlistenSkinOptions => {
        return loadSkin(context).then(unlistenSkin => {
            return () => {
                unlistenSkinOptions();
                unlistenSkin();
            };
        });
    });
}

function loadSkin(context: GlobalContextData): Promise<UnlistenFn> {
    const skin = context.settings.selectedSkin;
    return Promise.all([
        resolve(`skins/${skin}/background.png`),
        resolve(`skins/${skin}/mouse.png`),
        resolve(`skins/${skin}/mouseArm.png`),
        resolve(`skins/${skin}/keyboardArm.png`),
    ]).then(files => {
        console.log("Skin loaded:", skin);
        const sheet = document.styleSheets[document.styleSheets.length - 1];
        sheet.insertRule(`#background { background-image: url(${convertFileSrc(files[0])}) }`, 0);
        sheet.insertRule(`#mouseDevice { background-image:  url(${convertFileSrc(files[1])}) }`, 0);
        sheet.insertRule(`#mouseArm { background-image: url(${convertFileSrc(files[2])}) }`, 0);
        sheet.insertRule(`#keyboardArm { background-image:  url(${convertFileSrc(files[3])}) }`, 0);
        return files;
    }).then(files => {
        console.log("Listening for skin file changes on current skin");
        return watch(files, _ => {
            console.log("Skin changed, reloading");
            context.ops.reload();
        }, { delayMs: 1000 });
    }).catch(error => {
        throw new Error("Skin issue!\n" + error.message);
    });
}

function loadSkinOptions(context: GlobalContextData): Promise<UnlistenFn> {
    return readDir('skins', { dir: BaseDirectory.Resource }).then(entries => {
        const options = entries.filter(entry => !!entry.children).map(entry => entry.name as string);
        if (options.length > 0) {
            context.app.skinOptions = options;
            console.log("Skin options:", options);
        } else {
            throw new Error("No skins found!")
        }
    }).then(_ => {
        console.log("Listening for changes to the skins folder");
        return resolve('skins').then(path =>
            watch(path, _ => {
                console.log("Skin options changed, reloading");
                context.ops.reload();
            }, { delayMs: 1000 }));
    }).catch(error => {
        throw new Error("Skin folder issue!\n" + error.message);
    });
}

function resolve(path: string): Promise<string> {
    return exists(path, { dir: BaseDirectory.Resource }).then(fileExists => {
        if (fileExists) {
            return resolveResource(path);
        }
        throw new Error(path);
    });
}