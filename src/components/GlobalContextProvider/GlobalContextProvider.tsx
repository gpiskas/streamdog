import { ReactNode, createContext, useEffect, useState } from "react";
import { convertFileSrc, invoke } from "@tauri-apps/api/tauri";
import { BaseDirectory, exists, readTextFile } from "@tauri-apps/api/fs";
import { watch } from "tauri-plugin-fs-watch-api";
import { UnlistenFn } from "@tauri-apps/api/event";
import { registerListeners } from "../../utils";
import { resolveResource } from "@tauri-apps/api/path";

export interface GlobalContextData {
    displaySize: number[]
    userSettings: UserSettings
    errorMessage?: string
}

export interface UserSettings {
    skin: string
    alwaysOnTop: boolean,
    hideKeystrokes: boolean,
    mouseArmPos: number[],
    keyboardArmPos: number[],
}

export const GlobalContext = createContext<GlobalContextData>({} as GlobalContextData);

type Props = { children: ReactNode }

const configFile = "config.json";

const defaultSettings: UserSettings = {
    skin: 'dog',
    alwaysOnTop: false,
    hideKeystrokes: false,
    mouseArmPos: [180, 100],
    keyboardArmPos: [215, 250],
};

export default function GlobalContextProvider({ children }: Props) {
    const [context, setContext] = useState<GlobalContextData | null>(null);

    useEffect(loadContext, []);

    function loadContext() {
        return registerListeners(
            loadContextData().then(context =>
                loadAndWatchSkinFiles(context)
                    .finally(() => {
                        console.log("Context loaded", context);
                        setContext(context);
                    })
            ));
    }

    function loadContextData(): Promise<GlobalContextData> {
        return Promise.all([
            loadDisplaySize(),
            loadUserSettings(),
        ]).then(res => ({
            displaySize: res[0],
            userSettings: res[1]
        }));
    }

    function loadDisplaySize(): Promise<number[]> {
        return invoke('get_display_size');
    }

    function loadUserSettings(): Promise<UserSettings> {
        return exists(configFile, { dir: BaseDirectory.Resource })
            .then(fileExists => {
                if (fileExists) {
                    console.log("Reading", configFile);
                    return readTextFile(configFile, { dir: BaseDirectory.Resource })
                        .then(config => ({ ...defaultSettings, ...JSON.parse(config) }));
                }
                return defaultSettings;
            });
    }

    function loadAndWatchSkinFiles(context: GlobalContextData): Promise<UnlistenFn> {
        return loadSkin(context)
            .then(files => watchSkinFiles(files))
            .catch((err: Error) => {
                context.errorMessage = err.message;
                return () => { };
            });
    }

    function loadSkin(context: GlobalContextData): Promise<string[]> {
        const skin = context.userSettings.skin;
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

    return (
        <>
            {context &&
                <GlobalContext.Provider value={context}>
                    {children}
                </GlobalContext.Provider>
            }
        </>

    )
}