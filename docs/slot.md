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

    this._slotCtrl.addListener('[default]', '*', (node) => {
      // I am called every time a new node enters the default slot
    });
  }

  render() {
    return html`
      <slot></slot>
    `;
  }
}
```

## Options

N/A

## Methods

### `addListener(slot, selector, callback)`

This adds a listener to the controller which will be called any time an element
is slotted into the referenced slot and matches the `selector`.

- `slot` may be the name of a slot, or a `Ref` of a slot element
- `selector` must be a CSS selector
- `callback` is a function called when matching elements are slotted

In both `slot` and `selector`, you may use `*` to specify "all slots" or
"all elements".

You may also use `[default]` to reference the default slot.

For example:

```ts
ctrl.addListener('*', '*', (node) => {
  // I am called when any element is slotted into any slot
});

ctrl.addListener('[default]', '*', (node) => {
  // I am called when any element is slotted into the default slot
});

ctrl.addListener('myslot', '*', (node) => {
  // I am called when any element is slotted into a slot with the name "myslot"
});

ctrl.addListener('[default]', 'span', (node) => {
  // I am called when a <span> is slotted into the default slot
});
```

### `has(slot[, selector, options])`

This can be used to determine if the current host element has slotted elements
in a given slot.

A selector may also be specified to narrow the selection.

For example:

```ts
// true if the default slot has elements
ctrl.has('[default]');

// true if any slots have slotted elements
ctrl.has('*');

// true if the <slot> named "foo" has slotted elements
ctrl.has('foo');

// true if a `<span>` has been slotted into the default slot
ctrl.has('[default]', 'span');
```

You may also specify `options` to further customise the behaviour:

- `options.flatten` - see [here](https://developer.mozilla.org/en-US/docs/Web/API/HTMLSlotElement/assignedElements#flatten)
