# elementVisibility

`elementVisibility` allows you to observe the current visibility of a particular
element within the viewport. That is, when the element is outside the viewport,
the visibility will be `false`.

## Usage

```ts
class MyElement extends LitElement {
  constructor() {
    super();

    this._elementVisibilityCtrl = new ElementVisibilityController(this);
  }

  render() {
    const visibility = this._elementVisibilityCtrl.visible ? 'visible' : 'hidden';

    return html`
      This element is currently ${visibility}.
    `;
  }
}
```

## Options

When constructing this controller, you can specify the following as additional
parameters:

- `ref`

### `ref`

You can pass a [`ref`](https://lit.dev/docs/templates/directives/#ref),
such that the referenced element will have its visibility observed rather than
the host element.

You should create such a ref via the `createRef` helper and use the `ref`
directive to populate it.

For example:

```ts
class MyElement extends LitElement {
  constructor() {
    super();
    this._myRef = createRef();
    this._elementVisibilityCtrl = new ElementVisibilityController(
      this,
      this._myRef
    );
  }

  render() {
    const visibility = this._elementVisibilityCtrl.visible ? 'visible' : 'hidden';

    return html`
      <p>The element below is currently ${visibility}.</p>

      <div ${ref(this._myRef)}>
        This element is being observed.
      </div>
    `;
  }
}
```
