import { ReactNode, useEffect, useState } from "react";
import { registerListeners } from "../../utils";
import { appWindow } from "@tauri-apps/api/window";
import { loadAndWatchSkinFiles } from "./skins";
import { Settings, loadDisplaySize, loadSettings, saveSettings } from "./settings";
import { GlobalContext, GlobalContextData } from "./context";

type Props = { children: ReactNode }
export default function GlobalContextProvider({ children }: Props) {
    const [context, setContext] = useState<GlobalContextData>({} as GlobalContextData);

    useEffect(loadContext, []);

    function loadContext() {
        return registerListeners(
            loadContextData().then(context =>
                loadAndWatchSkinFiles(context)
                    .finally(() => {
                        console.log("Context loaded", context);
                        appWindow.setAlwaysOnTop(context.settings.alwaysOnTop)
                        setContext(context);
                    })
            ));
    }

    function loadContextData(): Promise<GlobalContextData> {
        return Promise.all([
            loadDisplaySize(),
            loadSettings(),
        ]).then(res => {
            return {
                displaySize: res[0],
                settings: res[1],
                toggleAlwaysOnTop: toggleAlwaysOnTop
            };
        });
    }

    function toggleAlwaysOnTop() {
        updateSettings(settings => {
            appWindow.setAlwaysOnTop(!settings.alwaysOnTop);
            settings.alwaysOnTop = !settings.alwaysOnTop;
        });
    }

    async function updateSettings(updater: (settings: Settings) => void) {
        setContext(ctx => {
            updater(ctx.settings);
            saveSettings(ctx.settings);
            return { ...ctx };
        })
    }

    function isContextLoaded() {
        return !!context.settings;
    }

    return (
        <>
            {isContextLoaded() &&
                <GlobalContext.Provider value={context}>
                    {children}
                </GlobalContext.Provider>
            }
        </>

    )
}