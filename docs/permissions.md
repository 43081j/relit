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

There is a brief moment until the controller status is resolved to either `prompt`, `granted` or `denied`.
To intercept this brief undefined state, a new state has been introduced.
The `AsyncPermissionState` type extends `PermissionState` by `pending` as the initial state of the controller.

```ts
class MyElement extends LitElement {
  constructor() {
    super();

    this._permissionsCtrl = new PermissionsController(this, 'geolocation');
  }

  render() {
    const {state} = this._permissionsCtrl;

    return html`
    ${
      'geolocation' in navigator && state !== 'pending'
        ? html`Geolocation permission is ${state}`
        : null
    }
  `;
}
```

## Options

N/A
