import { UI_TEXT } from "../constants/app";

export interface StorageResult<T> {
  value: T;
  error?: string;
}

export interface StorageWriteResult {
  ok: boolean;
  error?: string;
}

export interface LocalStorageApi {
  getItem: <T>(key: string, fallback: T) => StorageResult<T>;
  setItem: <T>(key: string, value: T) => StorageWriteResult;
  removeItem: (key: string) => StorageWriteResult;
}

const isQuotaExceeded = (error: unknown): boolean =>
  error instanceof DOMException &&
  (error.name === "QuotaExceededError" || error.name === "NS_ERROR_DOM_QUOTA_REACHED");

const isStorageAvailable = (): boolean =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

export const storage: LocalStorageApi = {
  getItem: <T,>(key: string, fallback: T): StorageResult<T> => {
    if (!isStorageAvailable()) {
      return { value: fallback, error: UI_TEXT.storageReadFailed };
    }

    try {
      const rawValue = window.localStorage.getItem(key);
      if (rawValue === null) {
        return { value: fallback };
      }
      return { value: JSON.parse(rawValue) as T };
    } catch {
      return { value: fallback, error: UI_TEXT.storageReadFailed };
    }
  },

  setItem: <T,>(key: string, value: T): StorageWriteResult => {
    if (!isStorageAvailable()) {
      return { ok: false, error: UI_TEXT.storageFull };
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: isQuotaExceeded(error) ? UI_TEXT.storageFull : "本地保存失败，请稍后重试。"
      };
    }
  },

  removeItem: (key: string): StorageWriteResult => {
    if (!isStorageAvailable()) {
      return { ok: false, error: "本地存储不可用。" };
    }

    try {
      window.localStorage.removeItem(key);
      return { ok: true };
    } catch {
      return { ok: false, error: "删除本地数据失败。" };
    }
  }
};

export const useLocalStorage = (): LocalStorageApi => storage;

