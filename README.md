# relit

relit (reactive lit) is a collection of utilities to provide various features
as reactive state to [lit](https://lit.dev) components.

DOM state, web APIs, property history and much more.

## Install

To install `relit`, simply add it as a dependency to your lit project:

```sh
npm i -S relit
```

## List of utilities

The following is the full list of available utilities:

- [activeElement](./docs/activeElement.md) - observable [document.activeElement](https://developer.mozilla.org/en-US/docs/Web/API/Document/activeElement)
- [bindInput](./docs/bindInput.md) - two-way bindings of form controls/inputs
- [documentVisibility](./docs/documentVisibility.md) - observable [document.visibilityState](https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilityState)
- [elementSize](./docs/elementSize.md) - element width and height
- [elementVisibility](./docs/elementVisibility.md) - element visibility
- [head](./docs/head.md) - `<head>` tag management
- [itemSelection](./docs/itemSelection.md) - manages selection within an array of items
- [keyBinding](./docs/keyBinding.md) - key bindings (shortcuts) manager
- [localStorage](./docs/localStorage.md) - items in [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [markdown](./docs/markdown.md) - markdown processing via [marked](https://github.com/markedjs/marked)
- [onLongPress](./docs/onLongPress.md) - fire callback on long press
- [permissions](./docs/permissions.md) - track the state of a browser [permission](https://developer.mozilla.org/en-US/docs/Web/API/Permissions/query)
- [propertyHistory](./docs/propertyHistory.md) - track the history of a property with undo/redo
- [sessionStorage](./docs/sessionStorage.md) - items in [sessionStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage)
- [slot](./docs/slot.md) - track slotted elements
- [windowScroll](./docs/windowScroll.md) - track the window scroll offset

## License

MIT
