# itemSelection

`itemSelection` allows you to navigate around an array of items (via methods
like `next()` and `prev()`), and react to the selection having changed.

## Usage

```ts
class MyElement extends LitElement {
  @state()
  public items: string[] = ['one', 'two', 'three'];

  constructor() {
    super();

    this._itemSelectionCtrl = new ItemSelectionController(
      this,
      this.items
    );
  }

  render() {
    const {selectedItems} = this._itemSelectionCtrl;

    return html`
      Selected strings are: ${selectedItems}.

      <button
        @click=${() => this._itemSelectionCtrl.next()}>
        Next item
      </button>

      <button
        @click=${() => this._itemSelectionCtrl.prev()}>
        Previous item
      </button>
    `;
  }
}
```

In this example, we would initially render nothing (no selection) and would
use single-selection mode (the default).

On clicking `Next item`, we would select the first item (`"one"`).

If we continued to click `Next item`, we would select the second item (`"two"`).

## Options

This controller accepts an optional `options` parameter, which is an object
used to configure various features.

### `options.multiSelect`

If you set this to `true`, multiple items may be selected.

For example, you may call `selectByIndex(0)` followed by `selectByIndex(1)` and
both will remain marked as selected.

This also means you can no longer use the following methods (as they will
only function with a single selection):

- `next()`
- `prev()`
- `selectByOffset()`

### `options.defaultSelectedIndices`

You can specify the default selection via this option, using the indices.

This is useful when you want to default to the item at a particular position
rather than a particular item.

For example, it is possible to select the first item by default. You can do
this by setting `defaultSelectedIndices: [0]`.

## Methods

### `next()`

In single-selection mode, moves the selection to the next item.

If there is no next item, it will remain at the last item.

### `prev()`

In single-selection mode, moves the selection to the previous item.

If there is no previous item, it will remain at the first item.

### `selectByOffset(offset)`

In single-selection mode, moves the selection by the specified offset.

For example, `selectByOffset(-2)` will select the item positioned two places
before the current selection.

If there is no item at such an offset, the item at the boundary will be
selected (the first or last item, depending on if you moved positively
or negatively).

### `selectByIndex(index)`

Selects the item at the given index.

### `select(item)`

Selects the given item.

### `deselectAll()`

Deselects all items.

### `selectAll()`

Selects all items.

### `deselect(item)`

Deselects the given item.

### `deselectByIndex(index)`

Deselects the item at the given index.

### `toggleByIndex(index[, selected])`

Toggles the item at the given index.

For example, if the item at `2` is selected, `toggleByIndex(2)` will deselect
it.

You can optionally also specify the selection state to force a select or
deselect (e.g. `toggleByIndex(2, true)` to force `2` to be selected).

### `toggle(item[, selected])`

Toggles the given item.

As with `toggleByIndex`, you can optionally specify the selection state to
force a select or a deselect.
