import { invoke } from "@tauri-apps/api";
import { getName, getVersion } from "@tauri-apps/api/app";
import { exists, BaseDirectory, readTextFile, writeTextFile } from "@tauri-apps/api/fs";

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