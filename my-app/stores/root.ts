import {createContext, useContext} from "react";
import { createGuiStore, IGuiStore } from "./gui";
import { createAuthStore, IAuthStore } from "./auth";
import { createDriverStore, IDriverStore } from "./driver";
import { createChatStore, IChatStore } from "./chat";
import { createAuthService } from "@/services/auth";
import { loggerService } from "@/services/logger";

export interface IRootStore {
    gui: IGuiStore;
    auth: IAuthStore;
    driver: IDriverStore;
    chat: IChatStore;
}

export const createParentStore = (): IRootStore => {
    const authService = createAuthService();
    
    const tempStore = {
        auth: {} as IAuthStore,
        gui: {} as IGuiStore,
        driver: {} as IDriverStore,
        chat: {} as IChatStore,
    } as IRootStore;

    const authStore = createAuthStore(tempStore, loggerService, authService);
    const guiStore = createGuiStore(tempStore, loggerService);
    const driverStore = createDriverStore(tempStore, loggerService);
    const chatStore = createChatStore(tempStore, loggerService);

    const store: IRootStore = {
        auth: authStore,
        gui: guiStore,
        driver: driverStore,
        chat: chatStore,
    };

    driverStore.init();

    return store;
};

export const parentStore = createParentStore();
export const ParentStoreContext = createContext<IRootStore>(parentStore);
export const StoreProvider = ParentStoreContext.Provider;
export const useStorage = () => useContext(ParentStoreContext);
