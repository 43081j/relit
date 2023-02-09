# slot

`slot` allows you to react to changes in your [slotted](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/slot)
elements.

For example, if you'd like to observe when a particular type of node is
slotted into your element.

## Usage

```ts
class MyElement extends LitElement {
  constructor() {
    super();

    this._slotCtrl = new SlotController(this);

    this._slotCtrl.addListener('*', (node) => {
      // I am called every time a new node enters the slot
    });
  }

  render() {
    return html`
      <slot ${ref(this.slotCtrl.ref)}>
      </slot>
    `;
  }
}
```

## Options

When constructing the slot controller, a [`ref`](https://lit.dev/docs/templates/directives/#ref)
is automatically created.

You may override this by passing your own ref:

```ts
const myRef = createRef();
const ctrl = new SlotController(host, myRef);
```

## Methods

### `addListener(selector, callback)`

This adds a listener to the controller which will be called any time an element
is slotted into the referenced slot and matches the `selector`.

For example:

```ts
ctrl.addListener('*', (node) => {
  // I am called when any element is slotted
});
```

The selector is any valid CSS selector:

```ts
ctrl.addListener('div', (node) => {
  // I am called when a `<div>` is slotted
});
```
