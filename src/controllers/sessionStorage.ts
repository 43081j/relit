import {StorageController} from '../_internal/storage.js';
import {ReactiveControllerHost} from 'lit';

/**
 * Tracks the contents of a given key in session storage
 */
export class SessionStorageController<T> extends StorageController<T> {
  /**
   * @param {ReactiveControllerHost} host Host to attach to
   * @param {string} key Key to observe in the storage object
   * @param {T=} defaultValue Default value
   */
  public constructor(
    host: ReactiveControllerHost,
    key: string,
    defaultValue?: T
  ) {
    super(host, window.sessionStorage, key, defaultValue);
  }
}
