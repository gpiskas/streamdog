import { createContext } from "react";
import { Settings } from "./settings";

export interface GlobalContextData {
    settings: Settings
    app: {
        errorMessage?: string
        displaySize: number[]
        skinOptions: string[]
        windowFocused: boolean
    }
    ops: {
        reload: () => void
        toggleAlwaysOnTop: () => void
        toggleKeystrokes: () => void
        selectSkin: (skin: string) => void
        resetSettings: () => void
    }
}

export const GlobalContext = createContext<GlobalContextData>({} as GlobalContextData);
