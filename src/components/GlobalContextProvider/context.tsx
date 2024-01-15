import { createContext } from "react";
import { Settings } from "./settings";

export interface GlobalContextData {
    displaySize: number[]
    skinOptions: string[]
    settings: Settings
    errorMessage?: string
    reload: () => void
    toggleAlwaysOnTop: () => void
    toggleKeystrokes: () => void
    selectSkin: (skin: string) => void
    resetSettings: () => void
}

export const GlobalContext = createContext<GlobalContextData>({} as GlobalContextData);
