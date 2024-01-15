import { ReactNode, useEffect, useState } from "react";
import { registerListeners } from "../../utils";
import { appWindow } from "@tauri-apps/api/window";
import { loadSkinData } from "./skins";
import { Settings, loadDisplaySize, loadSettings, resetDefaultSettings, saveSettings } from "./settings";
import { GlobalContext, GlobalContextData } from "./context";
import Error from '../Error/Error';

type Props = { children: ReactNode }
export default function GlobalContextProvider({ children }: Props) {
    const [context, setContext] = useState<GlobalContextData>({} as GlobalContextData);

    useEffect(loadContext, []);

    function loadContext() {
        registerListeners(
            loadContextData().then(context => {
                initializeContext(context);
                const unlisten = loadSkinData(context);
                unlisten.catch(err => context.errorMessage = err.message)
                    .finally(() => setContext(context));
                return unlisten;
            }));
    }

    function initializeContext(context: GlobalContextData) {
        console.log("Context loaded:", context);
        appWindow.setAlwaysOnTop(context.settings.alwaysOnTop);
    }

    function loadContextData(): Promise<GlobalContextData> {
        return Promise.all([
            loadDisplaySize(),
            loadSettings(),
        ]).then(res => {
            return {
                skinOptions: [],
                displaySize: res[0],
                settings: res[1],
                reload: reload,
                toggleAlwaysOnTop: toggleAlwaysOnTop,
                toggleKeystrokes: toggleKeystrokes,
                selectSkin: selectSkin,
                resetSettings: resetSettings,
            };
        });
    }

    function resetSettings() {
        resetDefaultSettings().then(reload);
    }

    function toggleAlwaysOnTop() {
        updateSettings(settings => {
            appWindow.setAlwaysOnTop(!settings.alwaysOnTop);
            settings.alwaysOnTop = !settings.alwaysOnTop;
        });
    }

    function toggleKeystrokes() {
        updateSettings(settings => {
            settings.showKeystrokes = !settings.showKeystrokes;
        });
    }

    function selectSkin(skin: string) {
        updateSettings(settings => {
            settings.selectedSkin = skin;
        }).then(reload)
    }

    function updateSettings(updater: (settings: Settings) => void) {
        return Promise.resolve(
            setContext(ctx => {
                updater(ctx.settings);
                saveSettings(ctx.settings);
                return { ...ctx };
            }));
    }

    function reload() {
        window.location.reload();
    }

    function isContextLoaded() {
        return !!context.settings;
    }

    return (
        <GlobalContext.Provider value={context}>
            {context.errorMessage
                ? <Error />
                : isContextLoaded() && children
            }
        </GlobalContext.Provider>
    );
}