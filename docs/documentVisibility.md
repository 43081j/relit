# documentVisibility

`documentVisibility` allows you to observe the visibility state of a document.

## Usage

```ts
class MyElement extends LitElement {
  constructor() {
    super();

    this._documentVisibilityCtrl = new DocumentVisibilityController(this);
  }

  render() {
    return html`
      Document is currently ${this._documentVisibilityCtrl.visibility}.
    `;
  }
}
```

The `visibility` property will be one of the following string values:

- `hidden`
- `visible`

As defined [here](https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilityState).

## Options

N/A
