import { BaseDirectory, exists, readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";

export function createLayout(skin: string): Promise<void> {
    return exists(getLayoutFilePath(skin), { baseDir: BaseDirectory.Resource }).then(fileExists => {
        if (!fileExists) {
            return writeLayout(skin, '');
        }
        return Promise.resolve();
    }).catch(_ => {
        throw new Error(`Skin '${skin}' does not exist!`);
    })
}

export function writeLayout(skin: string, content: string): Promise<void> {
    return writeTextFile(getLayoutFilePath(skin), content, { baseDir: BaseDirectory.Resource });
}

export function readLayout(skin: string): Promise<string> {
    const layoutFile = getLayoutFilePath(skin);
    return exists(layoutFile, { baseDir: BaseDirectory.Resource }).then(fileExists => {
        if (fileExists) {
            return readTextFile(layoutFile, { baseDir: BaseDirectory.Resource });
        }
        return Promise.resolve('');
    });
}


function getLayoutFilePath(skin: string): string {
    return `skins/${skin}/.layout.html`;
}
