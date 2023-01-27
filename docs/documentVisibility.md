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
    const visibility = this._elementVisibilityCtrl.visible ? 'visible' : 'hidden';

    return html`
      Document is currently ${visibility}.
    `;
  }
}
```

The `visible` property will be `true` or `false` depending on if the document
is currently visible or not.

## Options

N/A
