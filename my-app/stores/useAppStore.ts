import { createContext, useContext } from 'react';
import { AppStore } from './appStore';
import { appStore } from './appStore';

export const AppStoreContext = createContext<AppStore>(appStore);

export const useAppStore = () => {
  const store = useContext(AppStoreContext);
  if (!store) {
    throw new Error('useAppStore must be used within AppStoreProvider');
  }
  return store;
};

export { appStore };
