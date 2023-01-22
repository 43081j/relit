# windowScroll

`windowScroll` allows you to observe the current scroll offset of the window.

## Usage

```ts
class MyElement extends LitElement {
  constructor() {
    super();

    this._scrollCtrl = new WindowScrollController(this);
  }

  render() {
    return html`
      X: ${this._scrollCtrl.x}
      Y: ${this._scrollCtrl.y}
    `;
  }
}
```

## Options

N/A
