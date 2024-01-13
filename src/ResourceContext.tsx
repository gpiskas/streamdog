import { createContext } from 'react';
import { resolveResource } from "@tauri-apps/api/path";
import { convertFileSrc } from "@tauri-apps/api/tauri";

export interface Resources {
    backgroundUrl: string
    mouseUrl: string
    armUrl: string
}

export const ResourceContext = createContext<Resources>({} as Resources);

export function loadResources(): Promise<Resources> {
    return Promise.all([
        resolve("resources/background.png"),
        resolve("resources/mouse.png"),
        resolve("resources/arm.png"),
    ]).then(res => {
        return {
            backgroundUrl: res[0],
            mouseUrl: res[1],
            armUrl: res[2],
        } as Resources;
    });
}

function resolve(path: string): Promise<string> {
    return resolveResource(path).then(res => `url(${convertFileSrc(res)})`);
}