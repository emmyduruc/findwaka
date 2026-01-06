import {createContext, useContext} from "react";
import { createGuiStore, IGuiStore } from "./gui";
import { createAuthStore, IAuthStore } from "./auth";
import { createDriverStore, IDriverStore } from "./driver";
import { createChatStore, IChatStore } from "./chat";
import { createDriverOnboardingStore, IDriverOnboardingStore } from "./driverOnboarding";
import { createAuthService } from "@/services/auth";
import { loggerService } from "@/services/logger";
import { createNotificationService, INotificationService } from "@/services/notifications";
import { createAnalyticsService } from "@/services/analytics";
import { createAppStore, IAppStore } from './appStore';

export interface IRootStore {
    gui: IGuiStore;
    auth: IAuthStore;
    driver: IDriverStore;
    chat: IChatStore;
    driverOnboarding: IDriverOnboardingStore;
    app: IAppStore;
    notificationService: INotificationService;
}

export const createParentStore = (): IRootStore => {
    const authService = createAuthService();
    
    const tempStore = {
        auth: {} as IAuthStore,
        gui: {} as IGuiStore,
        driver: {} as IDriverStore,
        chat: {} as IChatStore,
        driverOnboarding: {} as IDriverOnboardingStore,
        app: {} as IAppStore,
        notificationService: {} as INotificationService,
    } as IRootStore;

    const notificationService = createNotificationService(tempStore, loggerService);
    const analyticsService = createAnalyticsService(loggerService);
    
     analyticsService.init(tempStore);
    
    const appStore = createAppStore(tempStore, loggerService, analyticsService);
    appStore.setNotificationService(notificationService);
    
    const authStore = createAuthStore(tempStore, loggerService, authService, analyticsService);
    const guiStore = createGuiStore(tempStore, loggerService, analyticsService);
    const driverStore = createDriverStore(tempStore, loggerService, analyticsService);
    const chatStore = createChatStore(tempStore, loggerService, notificationService, analyticsService);
    const driverOnboardingStore = createDriverOnboardingStore(tempStore, loggerService, analyticsService);

    const store: IRootStore = {
        auth: authStore,
        gui: guiStore,
        driver: driverStore,
        chat: chatStore,
        driverOnboarding: driverOnboardingStore,
        app: appStore,
        notificationService,
    };

    driverStore.init();

    return store;
};

 export const parentStore = createParentStore();
export const ParentStoreContext = createContext<IRootStore | null>(null);
export const StoreProvider = ParentStoreContext.Provider;
export const useStorage = () => {
    const store = useContext(ParentStoreContext);
    if (!store) {
        throw new Error('useStorage must be used within StoreProvider');
    }
    return store;
};
