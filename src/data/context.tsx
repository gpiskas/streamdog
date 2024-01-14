import { invoke } from "@tauri-apps/api/tauri";
import { GlobalContextData, UserSettings } from "../components/GlobalContext";
import { BaseDirectory, exists, readTextFile } from "@tauri-apps/api/fs";

const configFile = "config.json";

const defaultSettings: UserSettings = {
    skin: 'dog',
    alwaysOnTop: false,
    hideKeystrokes: false,
    mouseArmPos: [180, 100],
    keyboardArmPos: [215, 250],
};

export function loadContextData(): Promise<GlobalContextData> {
    return Promise.all([
        loadDisplaySize(),
        loadUserSettings(),
    ]).then(res => {
        return {
            displaySize: res[0],
            userSettings: res[1]
        } as GlobalContextData;
    });
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