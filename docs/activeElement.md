# activeElement

`activeElement` allows you to observe the current active element of a document.

## Usage

```ts
class MyElement extends LitElement {
  constructor() {
    super();

    this._activeElementCtrl = new ActiveElementController(this);
  }

  render() {
    return html`
      Active element is: ${this._activeElementCtrl.activeElement?.nodeName}.
    `;
  }
}
```

## Options

An optional `doc` can be passed when constructing this controller, such that
you can observe the `activeElement` of a shadow root or a different document:

```ts
this._activeElementCtrl = new ActiveElementController(this, this.shadowRoot);
```

Each shadow root has its own active element, while the parent document will
only see as far as the shadow boundary (i.e. the host element) in terms of
its own `activeElement`.

You can read more about this [here](https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot/activeElement).
