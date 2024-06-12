# onLongPress

`onLongPress` allows you to bind a callback to a long press occurring (i.e.
a pointer being held down for a specified amount of time).

## Usage

```ts
class MyElement extends LitElement {
  render() {
    return html`
      <div ${onLongPress(this._onLongPress)}>
        Long press me!
      </div>
    `;
  }
}
```

This will call the `_onLongPress` method when the user holds their pointer
down for 1 second (the default).

The parameters (`onLongPress(fn, time)`) are as follows:

- `fn` - a function to call when the pointer has been held long enough
- `time` - the time in milliseconds to consider a press being 'long'

## Options

N/A
