import { invoke } from "@tauri-apps/api/core"
import { getName, getVersion } from "@tauri-apps/api/app";
import { exists, BaseDirectory, readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";

export interface Settings {
    selectedSkin: string
    alwaysOnTop: boolean,
    showKeystrokes: boolean,
}

const defaultSettings: Settings = {
    selectedSkin: 'doge',
    alwaysOnTop: false,
    showKeystrokes: true,
};

const settingsFile = "settings.json";

export function loadDisplaySize(): Promise<number[]> {
    return invoke('get_display_size');
}

export function loadAppInfo(): Promise<string> {
    return Promise.all([getName(), getVersion()]).then(res => {
        return `${res[0]} ${res[1]}`;
    })
}

export function loadSettings(): Promise<Settings> {
    return exists(settingsFile, { baseDir: BaseDirectory.Resource })
        .then(fileExists => {
            if (fileExists) {
                console.log("Reading", settingsFile);
                return readTextFile(settingsFile, { baseDir: BaseDirectory.Resource })
                    .then(settings => ({ ...defaultSettings, ...JSON.parse(settings) }));
            }
            return defaultSettings;
        });
}

export function saveSettings(settings: Settings): Promise<void> {
    return writeTextFile(settingsFile, JSON.stringify(settings), { baseDir: BaseDirectory.Resource });
}

export function resetDefaultSettings(): Promise<void> {
    return saveSettings(defaultSettings);
}