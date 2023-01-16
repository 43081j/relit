import {StorageController} from '../_internal/storage.js';
import {ReactiveControllerHost} from 'lit';

/**
 * Tracks the contents of a given key in local storage
 */
export class LocalStorageController<T> extends StorageController<T> {
  /**
   * @param {ReactiveControllerHost} host Host to attach to
   * @param {string} key Key to observe in the storage object
   * @param {T|undefined} defaultValue Default value
   */
  public constructor(
    host: ReactiveControllerHost,
    key: string,
    defaultValue: T | undefined
  ) {
    super(host, window.localStorage, key, defaultValue);
  }
}
