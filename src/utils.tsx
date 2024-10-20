import { UnlistenFn } from "@tauri-apps/api/event";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { open } from "@tauri-apps/plugin-shell";
import { resourceDir } from "@tauri-apps/api/path";

export function registerListeners(component: string, ...listeners: Promise<UnlistenFn>[]) {
    console.log("Registering listeners:", component);
    return () => {
        console.log("Unregistering listeners:", component);
        Promise.all(listeners).then(item => item.forEach(listener => listener()));
    };
}

export function getRectDistance(a: HTMLElement, b: HTMLElement): number[] {
    const aRect = a.getBoundingClientRect();
    const bRect = b.getBoundingClientRect();
    return [aRect.left - bRect.left, aRect.top - bRect.top]
}

export function getRadAngle(a: number, b: number): number {
    return Math.atan2(a, b);
}

export function getDistance(a: number, b: number): number {
    return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
}

export function preventDefault(event: React.SyntheticEvent): void {
    event.stopPropagation();
    event.preventDefault();
}

export function listenToFocusChange(callback: (focused: boolean) => void): Promise<UnlistenFn> {
    return getCurrentWebviewWindow().onFocusChanged(({ payload: focused }) => callback(focused))
}

export function openSkinsFolder(): Promise<string> {
    return resourceDir().then(dir => {
        open(`${dir}\\skins`);
        return dir;
    });
}

export function setAlwaysOnTop(alwaysOnTop: boolean): Promise<void> {
    return getCurrentWebviewWindow().setAlwaysOnTop(alwaysOnTop);
}

export function preventAllDefaultKeystrokesInProd() {
    if (import.meta.env.PROD) {
        window.addEventListener("keydown", e => e.preventDefault());
    }
}