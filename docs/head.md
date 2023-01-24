# head

`head` allows you to manage the `<head>` tag and various document metadata.

## Usage

```ts
class MyElement extends LitElement {
  constructor() {
    super();

    this._headCtrl = new HeadController(this);
  }

  onClickOfSomething() {
    this._headCtrl.setTitle('Example Page Title');

    this._headCtrl.update(html`
      <meta name="foo" content="some content">
      <meta name="bar" content="some content">
    `;
  }
}
```

## Options

An optional document argument can be passed to this controller if you wish
to manage a document other than the current one:

```ts
new HeadController(this, doc);
```

## Properties

### `titleTemplate`

Setting `titleTemplate` will apply a template any time the controller is used
to set the page title.

For example:

```ts
this._headCtrl.titleTemplate = '%s - My Website';

this._headCtrl.setTitle('Some Page'); // Some Page - My Website
```

### `defaultTitle`

This will set the default title to use when no other has been passed.

For example, when the element is first attached, it will set the page
title to this default.

Similarly, if you used `update` to render a `<title>` and since removed it,
the default will be used instead.

## Methods

### `update`

Allows you to render tags to the `<head>` of the document.

For example:

```ts
this._headCtrl.update(html`
  <meta name="foo" content="foo">

  <meta name="bar" content="bar">

  <title>Some Title</title>

  <base href="/">
`);
```

If you call this multiple times, **all previously rendered elements will be
replaced**.


The following elements are supported:

- `<title>`
- `<base>`
- `<meta>`
- `<link>`
- `<script>`
- `<noscript>`
- `<style>`

Note that `title` and `base` have special behaviour, in that they will replace
any existing equivalent head tag whether rendered by this controller or not.

### `setTitle`

Sets the page title:

```ts
this._headCtrl.setTitle('Page Title');
```

### `updateBodyTag`

Updates the `<body>` tag of the document with a specified set of attributes.

You may pass `null` as an attribute value to forcefully remove it.

For example:

```ts
this._headCtrl.updateBodyTag({
  'data-foo': 'foo',
  'data-bar': 'bar'
});

// <body data-foo="foo" data-bar="bar">

this._headCtrl.updateBodyTag({
  'data-foo': 'foo',
  'data-bar': null
});

// <body data-foo="foo">
```

**Keep in mind, all attributes are _additive_**. This means if you call the
method multiple times with different attributes, the tag will accumulate all of
them.

### `updateHtmlTag`

Updates the `<html>` tag of the document with a specified set of attributes.


You may pass `null` as an attribute value to forcefully remove it.

For example:

```ts
this._headCtrl.updateHtmlTag({
  'data-foo': 'foo',
  'data-bar': 'bar'
});

// <html data-foo="foo" data-bar="bar">

this._headCtrl.updateHtmlTag({
  'data-foo': 'foo',
  'data-bar': null
});

// <html data-foo="foo">
```

### `removeRenderedElements`

Removes all elements this controller has rendered via `update`.
