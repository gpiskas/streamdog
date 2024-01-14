import { invoke } from "@tauri-apps/api/tauri";
import { GlobalContextData, UserSettings } from "../components/GlobalContext";

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
    return Promise.resolve(defaultSettings)
    // return readTextFile("config.json", { dir: BaseDirectory.Resource });
}