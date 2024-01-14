import { createContext } from "react";
import { Settings } from "./settings";

export interface GlobalContextData {
    displaySize: number[]
    settings: Settings
    errorMessage?: string
    toggleAlwaysOnTop: () => void
}

export const GlobalContext = createContext<GlobalContextData>({} as GlobalContextData);
