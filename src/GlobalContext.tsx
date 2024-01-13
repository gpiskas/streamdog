import { createContext } from "react";

export interface GlobalContextData {
    displaySize: number[]
}

export const GlobalContext = createContext<GlobalContextData>({} as GlobalContextData);