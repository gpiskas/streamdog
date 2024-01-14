import { createContext } from "react";

export interface UserSettings {
    skin: string
    alwaysOnTop: boolean,
    hideKeystrokes: boolean,
    mouseArmPos: number[],
    keyboardArmPos: number[],
}

export interface GlobalContextData {
    displaySize: number[]
    userSettings: UserSettings
}

export const GlobalContext = createContext<GlobalContextData>({} as GlobalContextData);