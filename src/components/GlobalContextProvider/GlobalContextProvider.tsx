import { ReactNode, useEffect, useState } from "react";
import { registerListeners } from "../../utils";
import { appWindow } from "@tauri-apps/api/window";
import { loadSkinData } from "./skins";
import { loadDisplaySize, loadSettings, resetDefaultSettings, saveSettings } from "./settings";
import { GlobalContext, GlobalContextData } from "./GlobalContext";
import Error from '../Error/Error';

type Props = { children: ReactNode }
export default function GlobalContextProvider({ children }: Props) {
    const [context, setContext] = useState<GlobalContextData>({} as GlobalContextData);

    useEffect(useListeners, []);

    function useListeners() {
        return registerListeners(GlobalContextProvider.name,
            loadContext(),
            listenToWindowFocusChange()
        );
    }

    function loadContext() {
        return loadContextData().then(context => {
            initializeContext(context);
            const unlisten = loadSkinData(context);
            unlisten.catch(err => context.app.errorMessage = err.message)
                .finally(() => setContext(context));
            return unlisten;
        });
    }

    function listenToWindowFocusChange() {
        return appWindow.onFocusChanged(({ payload: focused }) => setWindowFocused(focused));
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
                settings: res[1],
                app: {
                    skinOptions: [],
                    displaySize: res[0],
                    windowFocused: true,
                },
                ops: {
                    reload: reload,
                    toggleAlwaysOnTop: toggleAlwaysOnTop,
                    toggleKeystrokes: toggleKeystrokes,
                    selectSkin: selectSkin,
                    resetSettings: resetSettings,
                }
            };
        });
    }

    function resetSettings() {
        resetDefaultSettings().then(reload);
    }

    function setWindowFocused(windowFocused: boolean) {
        updateContext(context => {
            context.app.windowFocused = windowFocused;
        });
    }

    function toggleAlwaysOnTop() {
        updateContext(context => {
            appWindow.setAlwaysOnTop(!context.settings.alwaysOnTop);
            context.settings.alwaysOnTop = !context.settings.alwaysOnTop;
        });
    }

    function toggleKeystrokes() {
        updateContext(context => {
            context.settings.showKeystrokes = !context.settings.showKeystrokes;
        });
    }

    function selectSkin(skin: string) {
        updateContext(context => {
            context.settings.selectedSkin = skin;
        }).then(reload);
    }

    function updateContext(updater: (context: GlobalContextData) => void) {
        return Promise.resolve(
            setContext(ctx => {
                updater(ctx);
                saveSettings(ctx.settings);
                return { ...ctx };
            }));
    }

    function reload() {
        window.location.reload();
    }

    console.debug('Rendering', GlobalContextProvider.name);
    return (
        <>
            {context.app &&
                <GlobalContext.Provider value={context}>
                    {context.app.errorMessage ? <Error /> : children}
                </GlobalContext.Provider >
            }
        </>
    );
}