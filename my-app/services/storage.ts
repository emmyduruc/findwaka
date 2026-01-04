import AsyncStorage from "@react-native-async-storage/async-storage";

export const getToken = async () => {
  return await AsyncStorage.getItem("$token_bearer");
};

export const getKeyCode = async () => {
  return await AsyncStorage.getItem("$key_code");
};

export const destoryKeyCode = async () => {
  await AsyncStorage.removeItem("$key_code");
};

export const destoryToken = async () => {
  await AsyncStorage.removeItem("$token_bearer");
};

export const _setToken = async (value: string) => {
  return await AsyncStorage.setItem("$token_bearer", value);
};

/**
 *
 * @param {string} key
 * @param {string} value
 * @return {Promise<void>}
 */
export const setStorage = async (key: string, value: string): Promise<void> => {
  return await AsyncStorage.setItem(`${key}`, `${value}`);
};

/**
 *
 * @param {string} key
 * @return {Promise<string>}
 */
export const getStorage = async (key: string): Promise<string | null> => {
  return await AsyncStorage.getItem(`${key}`);
};

/**
 *
 * @param {string} key
 * @return {Promise<string>}
 */
export const destoryStorage = async (key: string): Promise<void> => {
  return await AsyncStorage.removeItem(key);
};


export const userStorage = (userId: string) =>
  AsyncStorage.getItem(`user/${userId}/storage`);

export const storageService = AsyncStorage;