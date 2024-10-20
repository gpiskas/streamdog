import { UnlistenFn } from "@tauri-apps/api/event";
import { watch, exists, BaseDirectory, readDir } from "@tauri-apps/plugin-fs";
import { resolveResource } from "@tauri-apps/api/path";
import { convertFileSrc } from "@tauri-apps/api/core";
import { GlobalContextData } from "./GlobalContext";
import { createLayout } from "./layout";

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
    return createLayout(skin).then(_ => Promise.all([
        resolve(`skins/${skin}/background.png`),
        resolve(`skins/${skin}/mouse.png`),
        resolve(`skins/${skin}/mouseArm.png`),
        resolve(`skins/${skin}/keyboardArm.png`),
    ])).then(files => {
        console.log("Skin loaded:", skin);
        const sheet = document.styleSheets[document.styleSheets.length - 1];
        sheet.insertRule(`#background { background-image: ${toUrl(files[0])} }`, 0);
        sheet.insertRule(`#mouseDevice { background-image:  ${toUrl(files[1])} }`, 0);
        sheet.insertRule(`#mouseArm { background-image: ${toUrl(files[2])} }`, 0);
        sheet.insertRule(`#keyboardArm { background-image:  ${toUrl(files[3])} }`, 0);
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

function toUrl(path: string) {
    const url = convertFileSrc(path)
        .replace(/\(/g, "%28")
        .replace(/\)/g, "%29");
    return `url(${url})`;
}

function loadSkinOptions(context: GlobalContextData): Promise<UnlistenFn> {
    return readDir('skins', { baseDir: BaseDirectory.Resource }).then(entries => {
        const options = entries.filter(entry => entry.isDirectory).map(entry => entry.name as string);
        if (options.length > 0) {
            context.app.skinOptions = options;
            console.log("Skin options:", options);
        } else {
            throw new Error("No skins found!")
        }
    }).then(_ => {
        console.log("Listening for changes to the skins folder");
        return resolve('skins')
            .then(path =>
                watch(path, _ => {
                    console.log("Skin options changed, reloading");
                    context.ops.reload();
                }, { delayMs: 1000 }));
    }).catch(error => {
        throw new Error("Skin folder issue!\n" + error.message);
    });
}

function resolve(path: string): Promise<string> {
    return exists(path, { baseDir: BaseDirectory.Resource }).then(fileExists => {
        if (fileExists) {
            return resolveResource(path);
        }
        throw new Error(path);
    });
}

