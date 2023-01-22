import type {ReactiveController, ReactiveControllerHost} from 'lit';

export interface PropertyHistoryEntry<T> {
  value: T;
  date: Date;
}

/**
 * Tracks the history of a given property
 */
export class PropertyHistoryController<
  T extends ReactiveControllerHost,
  TKey extends keyof T
> implements ReactiveController
{
  /**
   * Gets the date of the last change
   * @return {Date|undefined}
   */
  public get lastChanged(): Date | undefined {
    return this.__history[this.__currentIndex]?.date;
  }

  /**
   * Gets the current history index
   * @return {number}
   */
  private get __currentIndex(): number {
    const maxIndex = this.__history.length - 1;
    return this.__historyIndex === -1 ? maxIndex : this.__historyIndex;
  }

  private __host: T;
  private __propertyName: TKey;
  private __history: Array<PropertyHistoryEntry<T[TKey]>>;
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
    this.__history = [
      {
        value,
        date: new Date()
      }
    ];

    host.addController(this);
  }

  /** @inheritdoc */
  public hostUpdate(): void {
    const newValue = this.__host[this.__propertyName];
    const maxIndex = this.__history.length - 1;
    const currentIndex = this.__currentIndex;
    const currentValue = this.__history[currentIndex];

    if (newValue !== currentValue?.value) {
      this.__history.splice(currentIndex + 1, maxIndex - currentIndex, {
        value: newValue,
        date: new Date()
      });
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
    const currentIndex = this.__currentIndex;
    const newIndex = currentIndex + offset;
    const prevValue = this.__history[newIndex];

    if (
      currentIndex < 0 ||
      newIndex < 0 ||
      newIndex > maxIndex ||
      prevValue === undefined
    ) {
      return;
    }

    this.__host[this.__propertyName] = prevValue.value;
    this.__historyIndex = newIndex === maxIndex ? -1 : newIndex;
    prevValue.date = new Date();
    this.__host.requestUpdate();
  }
}
