# keyBinding

`keyBinding` allows you to bind actions to particular key combinations on
either the host element or a referenced child element.

## Usage

```ts
class MyElement extends LitElement {
  constructor() {
    super();

    this._keyCtrl = new KeyBindingController(this);
    this._keyCtrl.bindKey('x', this._onXPressed);
  }

  render() {
    return html`
      You can press the X key in me to make something happen!
    `;
  }
}
```

## Options

When constructing this controller, you can specify the following as additional
parameters:

- `ref`
- `options`

### `ref`

You can pass a [`ref`](https://lit.dev/docs/templates/directives/#ref),
such that the referenced element will observe its key presses rather than the
host element.

You should create such a ref via the `createRef` helper and use the `ref`
directive to populate it.

For example:

```ts
class MyElement extends LitElement {
  constructor() {
    super();
    this._myRef = createRef();
    this._keyCtrl = new KeyBindingController(this, this._myRef);
  }

  render() {
    return html`
      <div ${ref(this._myRef)}>
        This div has key bindings!
      </div>
    `;
  }
}
```

### `options`

The options object allows you specify various global options for the binding
manager.

#### `options.ignoredElements`

Default: `['textarea', 'input', 'select']`

This option allows you to specify a set of elements which the manager will
ignore key presses from.

For example, by default if you press keys in an `<input>`, they will not be
handled by the manager.

The values you specify here are CSS selectors, allowing you to also do
something like the following:

```ts
{
  ignoredElements: ['.foo']
}
```

## Methods

### `bindKey(key, fn[, options])`

Binds a function to be called any time `key` is pressed.

By default, this binds to the `keyup` event which means the function will only
be called once the user releases the key.

You can also pass an `options` object to customise this behaviour.

#### `options.triggers`

You may specify a set of `triggers` to choose when your function is called
during a key press.

Supported triggers are:

- `keyup` - when the user has pressed and released a key
- `keydown` - when the user has pressed a key (**repeated while the user holds
the key down**)
- `firstKeyDown` - when the user has initially pressed a key

For example:

```ts
// calls `fn` as the user holds the `x` key
keybindings.bindKey('x', fn, {triggers: ['keydown']});
```

### `bindFocus(key, ref)`

Binds a key to focusing the specified element (by ref).

For example:

```ts
// Focus search input when user presses `/` key
keybindings.bindFocus('/', searchInputRef);
```

### `bindPush(key, fn)`

Binds a function to be called when a key is initially pressed, and when it is
later released.
