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

## Options

N/A
