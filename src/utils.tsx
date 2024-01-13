import { UnlistenFn } from "@tauri-apps/api/event";


export function unregisterListeners(listenersPromise: Promise<UnlistenFn[]>) {
    listenersPromise.then(listeners => listeners.forEach(listener => listener()));
}