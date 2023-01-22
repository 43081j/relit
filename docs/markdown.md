# markdown

`markdown` allows you to process markdown into HTML and render the result.

## Usage

```ts
class MyElement extends LitElement {
  @property({type: String})
  prop = `
    # Header

    Some text.
  `;

  constructor() {
    super();

    this._markdownCtrl = new MarkdownController(this, {
      property: 'prop'
    });
  }

  render() {
    return html`
      Rendered markdown:

      ${this._markdownCtrl.value}
    `;
  }
}
```

## Options

An options object may be passed to tailor how the markdown is generated.

### `options.property`

You may set `options.property` to the name of a
[reactive property](https://lit.dev/docs/components/properties/), such that
every time it updates, the value will be parsed as markdown.

This may be easier than calling `setValue` manually each time you want to
update the value.

For example:

```ts
this._markdownCtrl = new MarkdownController(this, {
  property: 'propertyOfThis'
});
```

In this example, every time `this.propertyOfThis` is changed, it will be parsed
as markdown and its rendered HTML placed in `this._markdownCtrl.value`.

### `options.markedOptions`

Under the hood, the markdown controller uses
[marked](https://github.com/markedjs/marked) to parse the markdown.

You may specify custom options for marked by passing `markedOptions`:

```ts
this._markdownCtrl = new MarkdownController(this, {
  markedOptions: {
    gfm: true
  }
});
```

## Methods

### `setValue(markdown)`

If you want to explicitly set the markdown value to be rendered, you can call
this method.

It is likely simpler to use the `options.property` option if your markdown
exists in a reactive property. However, there are still uses for setting the
value directly.

For example:

```ts
this._markdownCtrl.setValue(`
  # heading

  Some markdown text.
`);
```
