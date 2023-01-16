import type {ReactiveController, ReactiveControllerHost} from 'lit';

type CustomStorageEvent = CustomEvent<{storageArea: Storage; key: string}>;
type StorageEventLike = StorageEvent | CustomStorageEvent;

/**
 * Tracks the contents of a given storage mechanism
 */
export abstract class StorageController<T> implements ReactiveController {
  /**
   * Gets the current value
   * @return {T|undefined}
   */
  public get value(): T | undefined {
    return this.__value;
  }

  /**
   * Sets the current value
   * @param {T|undefined} newValue Value to set
   */
  public set value(newValue: T | undefined) {
    this.__value = newValue;
    this.__writeValueToStorage(newValue);
  }

  private __value: T | undefined;
  private __storage: Storage;
  private __key: string;
  private __boundOnStorage: (ev: StorageEventLike) => void;

  /**
   * @param {ReactiveControllerHost} host Host to attach to
   * @param {Storage} storage Storage to observe
   * @param {string} key Key to observe in the storage object
   * @param {T|undefined} defaultValue Default value
   */
  public constructor(
    host: ReactiveControllerHost,
    storage: Storage,
    key: string,
    defaultValue: T | undefined
  ) {
    this.__boundOnStorage = this.__onStorage.bind(this);
    this.__storage = storage;
    this.__key = key;

    const currentValue = this.__readValueFromStorage();

    if (currentValue === undefined && defaultValue !== undefined) {
      this.__value = defaultValue;
      this.__writeValueToStorage(this.__value);
    }

    host.addController(this);
  }

  /**
   * Fired when another window has changed a storage area
   * @param {StorageEvent} ev Event fired
   * @return {void}
   */
  private __onStorage(ev: StorageEventLike): void {
    const detail =
      ev.type === 'storage'
        ? (ev as StorageEvent)
        : (ev as CustomStorageEvent).detail;

    if (detail.storageArea === this.__storage && detail.key === this.__key) {
      const currentValue = this.__readValueFromStorage();
      this.__value = currentValue;
    }
  }

  /**
   * Updates the value in the given storage area
   * @param {T|undefined} val Value to write
   * @return {void}
   */
  private __writeValueToStorage(val: T | undefined): void {
    if (val === undefined) {
      this.__storage.removeItem(this.__key);
    } else {
      this.__storage.setItem(this.__key, JSON.stringify(val));
    }

    window.dispatchEvent(
      new CustomEvent<CustomStorageEvent['detail']>('__litkit-storage', {
        detail: {
          storageArea: this.__storage,
          key: this.__key
        }
      })
    );
  }

  /**
   * Updates the value from the given storage area
   * @return {void}
   */
  private __readValueFromStorage(): T | undefined {
    const json = this.__storage.getItem(this.__key);

    if (json !== null) {
      return JSON.parse(json) as T;
    }

    return undefined;
  }

  /** @inheritdoc */
  public hostConnected(): void {
    window.addEventListener('storage', this.__boundOnStorage);
    window.addEventListener('__litkit-storage', this.__boundOnStorage);
  }

  /** @inheritdoc */
  public hostDisconnected(): void {
    window.removeEventListener('storage', this.__boundOnStorage);
    window.removeEventListener('__litkit-storage', this.__boundOnStorage);
  }
}

declare global {
  interface WindowEventMap {
    '__litkit-storage': StorageEventLike;
  }
}
