# enumProperty

`enumProperty` allows you to constrain an observable property to a set of
values.

## Usage

```ts
class MyElement extends LitElement {
  @enumProperty({
    values: ['foo', 'bar']
  });
  public value?: string;

  render() {
    return html`
      Value is: ${this.value}
    `;
  }
}
```

In the above example, when `value` is set to something other than the allowed
values, it will be set back to `undefined`.

## Options

### Lit options

You may specify options to pass to Lit via a second argument:

```ts
@enumProperty({
  values: ['a', 'b']
}, {
  state: true
});
```

### `values`

`values` is a required property in the options object and specifies the valid
values for this property.

```ts
@enumProperty({
  values: ['a', 'b']
});
```

### `defaultValue`

`defaultValue` can be set to specify what the default value should be when
an invalid value has been set.

For example:

```ts
@enumProperty({
  values: ['a', 'b'],
  defaultValue: 'a'
});
public value: string;
```

In this example, setting `value` to an invalid value will result in it being
set to `a`.
