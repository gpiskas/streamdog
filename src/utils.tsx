import { UnlistenFn } from "@tauri-apps/api/event";

export function registerListeners(...listeners: Promise<UnlistenFn>[]) {
    console.log("Registering listeners");
    return () => {
        console.log("Unregistering listeners");
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
