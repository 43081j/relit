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

  /**
   * @param {ReactiveControllerHost} host Host to attach to
   * @param {string} property Property name to observe
   */
  public constructor(host: T, property: TKey) {
    const value = host[property];

    this.__host = host;
    this.__propertyName = property;
    this.__history = [value];

    host.addController(this as ReactiveController);
  }

  /** @inheritdoc */
  public hostUpdate(): void {
    const currentValue = this.__host[this.__propertyName];
    const lastValue = this.__history[this.__history.length - 1];

    if (currentValue !== lastValue) {
      this.lastChanged = new Date();
      this.__history.push(currentValue);

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
    const currentValue = this.__host[this.__propertyName];
    const currentIndex = this.__history.indexOf(currentValue);
    const newIndex = currentIndex + offset;
    const maxIndex = this.__history.length - 1;

    if (currentIndex < 0 || newIndex < 0 || newIndex > maxIndex) {
      return;
    }

    const prevValue = this.__history[newIndex] as T[TKey];

    this.__host[this.__propertyName] = prevValue;
  }
}
