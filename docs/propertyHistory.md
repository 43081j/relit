# propertyHistory

`propertyHistory` allows you to observe when a property of your element was last
changed. It also allows you to undo/redo changes to the property.

## Usage

```ts
class MyElement extends LitElement {
  @property({type: String})
  public someProp = 'foo';

  constructor() {
    super();

    this._propHistoryCtrl = new PropertyHistoryController(
      this,
      'someProp'
    );
  }

  render() {
    return html`
      someProp was last changed at ${this._propHistoryCtrl.lastChanged}.
    `;
  }
}
```

## Options

N/A

## Methods

There are two methods available:

- `undo`
- `redo`

There's a maximum of 4 versions of the property's value kept in memory. This
means you can only undo a maximum of 4 times, or if you already did that, you
can only redo a maximum of 4 times.

### `undo()`

Calling this will revert the property to its previous value.

### `redo()`

Calling this will restore a value you previous reverted.
