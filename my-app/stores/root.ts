import {createContext, useContext} from "react";
import { createGuiStore, IGuiStore } from "./gui";
import { createAuthStore, IAuthStore } from "./auth";
import { createDriverStore, IDriverStore } from "./driver";
import { createChatStore, IChatStore } from "./chat";
import { createDriverOnboardingStore, IDriverOnboardingStore } from "./driverOnboarding";
import { createAuthService } from "@/services/auth";
import { loggerService } from "@/services/logger";
import { createNotificationService, INotificationService } from "@/services/notifications";
import { appStore } from './appStore';

export interface IRootStore {
    gui: IGuiStore;
    auth: IAuthStore;
    driver: IDriverStore;
    chat: IChatStore;
    driverOnboarding: IDriverOnboardingStore;
    app: any; // AppStore - will be set after creation
}

export const createParentStore = (appStore: any): IRootStore => {
    const authService = createAuthService();
    
    const tempStore = {
        auth: {} as IAuthStore,
        gui: {} as IGuiStore,
        driver: {} as IDriverStore,
        chat: {} as IChatStore,
        driverOnboarding: {} as IDriverOnboardingStore,
        app: appStore,
    } as IRootStore;

    const notificationService = createNotificationService(tempStore, loggerService);
    const authStore = createAuthStore(tempStore, loggerService, authService);
    const guiStore = createGuiStore(tempStore, loggerService);
    const driverStore = createDriverStore(tempStore, loggerService);
    const chatStore = createChatStore(tempStore, loggerService, notificationService);
    const driverOnboardingStore = createDriverOnboardingStore();

    const store: IRootStore = {
        auth: authStore,
        gui: guiStore,
        driver: driverStore,
        chat: chatStore,
        driverOnboarding: driverOnboardingStore,
        app: appStore,
    };

    driverStore.init();

    return store;
};


export const parentStore = createParentStore(appStore);
export const ParentStoreContext = createContext<IRootStore>(parentStore);
export const StoreProvider = ParentStoreContext.Provider;
export const useStorage = () => useContext(ParentStoreContext);
