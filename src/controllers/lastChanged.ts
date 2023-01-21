import type {ReactiveController, ReactiveControllerHost} from 'lit';

/**
 * Tracks the last time a property was changed
 */
export class LastChangedController<
  T extends ReactiveControllerHost,
  TKey extends keyof T
> implements ReactiveController
{
  public lastChanged: Date | undefined = undefined;

  private __host: T;
  private __propertyName: TKey;
  private __history: Array<T[TKey]>;
  private __historyLimit: number = 4;
  private __historyIndex: number = -1;

  /**
   * @param {ReactiveControllerHost} host Host to attach to
   * @param {string} property Property name to observe
   */
  public constructor(host: T, property: TKey) {
    const value = host[property];

    this.__host = host;
    this.__propertyName = property;
    this.__history = [value];

    host.addController(this);
  }

  /** @inheritdoc */
  public hostUpdate(): void {
    const newValue = this.__host[this.__propertyName];
    const maxIndex = this.__history.length - 1;
    const currentIndex =
      this.__historyIndex === -1 ? maxIndex : this.__historyIndex;
    const currentValue = this.__history[currentIndex];

    if (newValue !== currentValue) {
      this.lastChanged = new Date();
      this.__history.splice(
        currentIndex + 1,
        maxIndex - currentIndex,
        newValue
      );
      this.__historyIndex = -1;

      if (this.__history.length > this.__historyLimit) {
        this.__history.shift();
      }

      this.__host.requestUpdate();
    }
  }

  /**
   * Roll the current value back to the previous value
   * @return {void}
   */
  public undo(): void {
    this.__restoreValueByOffset(-1);
  }

  /**
   * Roll the current value forward to what it previously was
   * @return {void}
   */
  public redo(): void {
    this.__restoreValueByOffset(1);
  }

  /**
   * Restores the value by an offset in the history
   * @param {number} offset Offset to restore
   * @return {void}
   */
  private __restoreValueByOffset(offset: number): void {
    const maxIndex = this.__history.length - 1;
    const currentIndex =
      this.__historyIndex === -1 ? maxIndex : this.__historyIndex;
    const newIndex = currentIndex + offset;

    if (currentIndex < 0 || newIndex < 0 || newIndex > maxIndex) {
      return;
    }

    const prevValue = this.__history[newIndex] as T[TKey];

    this.__host[this.__propertyName] = prevValue;
    this.__historyIndex = newIndex === maxIndex ? -1 : newIndex;
    this.lastChanged = new Date();
    this.__host.requestUpdate();
  }
}
