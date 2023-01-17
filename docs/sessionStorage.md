# sessionStorage

`sessionStorage` allows you to observe the value of a particular key in session
storage.

## Usage

```ts
class MyElement extends LitElement {
  constructor() {
    super();

    this._sessionStorageCtrl = new SessionStorageController(this, 'someKey');
  }

  render() {
    const val = JSON.stringify(this._sessionStorageCtrl.value;

    return html`
      someKey currently has the value: ${val}.
    `;
  }
}
```

## Options

The following options exist:

- `defaultValue`

### `defaultValue`

This parameter can be passed to specify what the value should default to if it
is not already set.

Specifying this will result in the default being stored in session storage if
the key doesn't already exist.

For example:

```ts
new SessionStorageController(
  this,
  'someKey',
  ['some', 'default']
);
```
