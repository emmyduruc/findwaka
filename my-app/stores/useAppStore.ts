import { createContext, useContext } from 'react';
import { useStorage } from './root';
import { IAppStore } from './appStore';

export const useAppStore = (): IAppStore => {
  const rootStore = useStorage();
  return rootStore.app;
};
