import type {ReactiveController, ReactiveControllerHost} from 'lit';

export interface ItemSelectionOptions<T> {
  multiSelect?: boolean;
  defaultSelectedIndices?: number[];
  defaultSelection?: T[];
}

/**
 * Tracks the selected items in a set of items
 */
export class ItemSelectionController<T> {
  /**
   * Gets the selected items
   * @return {T[]}
   */
  public get selectedItems(): T[] {
    return this.items.filter((_item, idx) => this.__selectedIndices.has(idx));
  }

  /**
   * Gets the current set of items
   * @return {T[]}
   */
  public get items(): T[] {
    if (this.__itemsGetter) {
      return this.__itemsGetter();
    }
    return this.__items;
  }

  private __selectedIndices: Set<number> = new Set<number>();
  private __items: T[] = [];
  private __itemsGetter?: () => T[];
  private __host: ReactiveControllerHost;
  private __options?: ItemSelectionOptions<T>;

  /**
   * @param {ReactiveControllerHost} host Host to attach to
   * @param {T[]} items Set of items to select within
   * @param {object} options Options for item selection
   */
  public constructor(
    host: ReactiveControllerHost,
    items: T[] | (() => T[]),
    options?: ItemSelectionOptions<T>
  ) {
    this.__host = host;
    if (typeof items === 'function') {
      this.__itemsGetter = items;
    } else {
      this.__items = items;
    }

    if (options) {
      this.__options = options;

      if (options.defaultSelectedIndices) {
        for (const idx of options.defaultSelectedIndices) {
          this.selectByIndex(idx);
        }
      } else if (options.defaultSelection) {
        for (const item of options.defaultSelection) {
          this.select(item);
        }
      }
    }

    host.addController(this as ReactiveController);
  }

  /**
   * If in single-selection mode, selects the next item if one exists
   * @return {void}
   */
  public next(): void {
    if (this.__options?.multiSelect === true) {
      throw new Error('next() cannot be used when in multi-select mode');
    }

    this.selectByOffset(1);
  }

  /**
   * If in single-selection mode, selects the previous item if one exists
   * @return {void}
   */
  public prev(): void {
    if (this.__options?.multiSelect === true) {
      throw new Error('prev() cannot be used when in multi-select mode');
    }

    this.selectByOffset(-1);
  }

  /**
   * If in single-selection mode, selects an item in relation to the
   * current selection by an offset.
   * @param {number} offset Offset to select by
   * @return {void}
   */
  public selectByOffset(offset: number): void {
    if (this.__options?.multiSelect === true) {
      throw new Error(
        'selectByOffset() cannot be used when in multi-select mode'
      );
    }

    const [currentSelection] = [...this.__selectedIndices];
    const items = this.items;
    let newIndex = 0;

    if (currentSelection !== undefined) {
      newIndex = currentSelection + offset;

      if (newIndex < 0) {
        newIndex = 0;
      } else if (newIndex >= items.length) {
        newIndex = items.length - 1;
      }
    }

    this.deselectAll();
    this.selectByIndex(newIndex);
  }

  /**
   * Selects the item at the given index
   * @param {number} idx Index to select
   * @return {void}
   */
  public selectByIndex(idx: number): void {
    this.toggleByIndex(idx, true);
  }

  /**
   * Selects the given item
   * @param {T} item Item to select
   * @return {void}
   */
  public select(item: T): void {
    this.toggle(item, true);
  }

  /**
   * Selects all items
   * @return {void}
   */
  public selectAll(): void {
    if (this.__options?.multiSelect !== true) {
      throw new Error('selectAll() cannot be used when in single-select mode');
    }

    const items = this.items;

    for (const item of items) {
      this.select(item);
    }
  }

  /**
   * Deselects all items
   * @return {void}
   */
  public deselectAll(): void {
    this.__selectedIndices.clear();
    this.__host.requestUpdate();
  }

  /**
   * Deselects the given item
   * @param {T} item Item to select
   * @return {void}
   */
  public deselect(item: T): void {
    this.toggle(item, false);
  }

  /**
   * Deselects the item at the given index
   * @param {number} idx Index to deselect
   * @return {void}
   */
  public deselectByIndex(idx: number): void {
    this.toggleByIndex(idx, false);
  }

  /**
   * Toggles the selection of the item at the given index
   * @param {number} idx Index of item to toggle
   * @param {boolean=} selected Force selection state rather than inverting it
   * @return {void}
   */
  public toggleByIndex(idx: number, selected?: boolean): void {
    if (idx < 0) {
      throw new Error('Index cannot be below 0');
    }

    const items = this.items;

    if (idx >= items.length) {
      throw new Error('Index cannot be greater than size of items array');
    }

    const multiSelect = this.__options?.multiSelect === true;
    const isSelected = this.__selectedIndices.has(idx);
    const newState = selected ?? !isSelected;

    if (newState && !multiSelect) {
      this.__selectedIndices.clear();
    }

    if (newState) {
      this.__selectedIndices.add(idx);
    } else {
      this.__selectedIndices.delete(idx);
    }

    this.__host.requestUpdate();
  }

  /**
   * Toggles the selection of the given item
   * @param {T} item Item to toggle
   * @param {boolean=} selected Force selection state rather than inverting it
   * @return {void}
   */
  public toggle(item: T, selected?: boolean): void {
    const idx = this.items.indexOf(item);

    if (idx === -1) {
      throw new Error('Item was not in items array');
    }

    this.toggleByIndex(idx, selected);
  }
}
