# bindInput

`bindInput` allows you to automatically bind a form input/control to a given
property (i.e. two-way binding).

## Usage

```ts
class MyElement extends LitElement {
  @property({type: String})
  public name: string = 'Bob';

  render() {
    return html`
      <label>
        Name:
        <input type="text" ${bindInput(this, 'name')}>
      </label>
    `;
  }
}
```

This will automatically two-way bind the `input` element and the `name`
property.

The parameters (`bindInput(host, property)`) are as follows:

- `host` - any object which has the specified `property`
- `property` - the name of the property on `host` to bind

### By attribute/property

You may also use this directive with an attribute or property binding:

```ts
    return html`
      <label>
        Name:
        <input type="text" .value=${bindInput(this, 'name')}>
      </label>
    `;
```

This may help with SSR, and will work the same way as the element binding
usage.

## Supported elements

The following elements are supported by this directive:

- `input`
- `select`
- `textarea`
- Compatible elements

### Events

By default, we listen for the `change` event and the `input` event.

### `<input type="checkbox">`

Checkbox inputs will result in a boolean value:

```ts
  return html`
    <input type="checkbox" ${bindInput(this, 'isEnabled')}>
  `;
```

In this example, `this.isEnabled` will be `true` or `false` depending on the
checked state of the input.

### `<select>`

Select element bindings differ depending on if the select is `multiple` or not.

With `<select multiple>`, the value will be an array of the selected values.

With a regular `<select>`, the value will be the selected value.

### Compatible elements

Any element which implements the following will be supported:

- Emits `change` events and/or `input` events
- Has a `value` property

## Options

N/A
