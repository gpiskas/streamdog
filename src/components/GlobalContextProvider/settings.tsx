import { invoke } from "@tauri-apps/api";
import { exists, BaseDirectory, readTextFile, writeTextFile } from "@tauri-apps/api/fs";

export interface Settings {
    selectedSkin: string
    alwaysOnTop: boolean,
    showKeystrokes: boolean,
    mouseArmPos: number[],
    keyboardArmPos: number[],
}

const defaultSettings: Settings = {
    selectedSkin: 'dog',
    alwaysOnTop: false,
    showKeystrokes: true,
    mouseArmPos: [180, 100],
    keyboardArmPos: [215, 250],
};

const settingsFile = "settings.json";

export function loadDisplaySize(): Promise<number[]> {
    return invoke('get_display_size');
}

export function loadSettings(): Promise<Settings> {
    return exists(settingsFile, { dir: BaseDirectory.Resource })
        .then(fileExists => {
            if (fileExists) {
                console.log("Reading", settingsFile);
                return readTextFile(settingsFile, { dir: BaseDirectory.Resource })
                    .then(settings => ({ ...defaultSettings, ...JSON.parse(settings) }));
            }
            return defaultSettings;
        });
}

export function saveSettings(settings: Settings): Promise<void> {
    return writeTextFile(settingsFile, JSON.stringify(settings), { dir: BaseDirectory.Resource });
}

export function resetDefaultSettings(): Promise<void> {
    return saveSettings(defaultSettings);
}