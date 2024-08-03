# permissions

`permissions` allows you to observe the state of a given browser permission.

For example, you may wish to observe the state of the `geolocation` permission
and know when it becomes `granted`.

## Usage

```ts
class MyElement extends LitElement {
  constructor() {
    super();

    this._permissionsCtrl = new PermissionsController(this, 'geolocation');
  }

  render() {
    return html`
      Geolocation permission is ${this._permissionsCtrl.state}
    `;
  }
}
```

The required argument is a [permission name](https://developer.mozilla.org/en-US/docs/Web/API/Permissions/query#name)
which varies across browsers in some cases.

The controller will expose a `state` property which is either a valid
[PermissionState](https://developer.mozilla.org/en-US/docs/Web/API/PermissionStatus/state)
or the string `pending`.

Initially, while querying the browser for a state, the state will be set to
`pending`.

## Options

N/A
