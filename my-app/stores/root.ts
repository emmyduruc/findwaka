import {createContext, useContext} from "react";
import { createGuiStore, IGuiStore } from "./gui";
import { createAuthStore, IAuthStore } from "./auth";
import { createAuthService } from "@/services/auth";
import { loggerService } from "@/services/logger";

export interface IRootStore {
    gui: IGuiStore;
    auth: IAuthStore;
}

export const createParentStore = (): IRootStore => {
    const authService = createAuthService();
    
    const tempStore = {
        auth: {} as IAuthStore,
        gui: {} as IGuiStore,
    } as IRootStore;

    const authStore = createAuthStore(tempStore, loggerService, authService);
    const guiStore = createGuiStore(tempStore, loggerService);

    const store: IRootStore = {
        auth: authStore,
        gui: guiStore,
    };

    return store;
};

export const parentStore = createParentStore();
export const ParentStoreContext = createContext<IRootStore>(parentStore);
export const StoreProvider = ParentStoreContext.Provider;
export const useStorage = () => useContext(ParentStoreContext);
