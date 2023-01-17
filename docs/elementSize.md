# elementSize

`elementSize` allows you to observe the size of a given element (width and
height).

## Usage

```ts
class MyElement extends LitElement {
  constructor() {
    super();

    this._elementSizeCtrl = new ElementSizeController(this);
  }

  render() {
    const {width, height} = this._elementSizeCtrl.size;
    return html`
      This element is currently ${width} by ${height}.
    `;
  }
}
```

As defined [here](https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilityState).

## Options

When constructing this controller, you can specify the following as additional
parameters:

- `type`
- `ref`

### `type`

The type can be used to specify what kind of size you want to observe. For
example, the content-box dimensions or the border-box dimensions.

You can read more about those types [here](https://developer.mozilla.org/en-US/docs/Web/CSS/box-sizing).

For example:

```ts
new ElementSizeController(this, 'border');
```

### `ref`

You can also pass a [`ref`](https://lit.dev/docs/templates/directives/#ref),
such that the referenced element will have its size observed rather than the
host element.

You should create such a ref via the `createRef` helper and use the `ref`
directive to populate it.

For example:

```ts
class MyElement extends LitElement {
  constructor() {
    super();
    this._myRef = createRef();
    this._elementSizeCtrl = new ElementSizeController(this, 'content', myRef);
  }

  render() {
    const {width, height} = this._elementSizeCtrl.size;
    return html`
      <p>The element below is currently ${width} by ${height}.</p>

      <div ${ref(this._myRef)}>
        Some element which changes size
      </div>
    `;
  }
}
```
