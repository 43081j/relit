import {PropertyDeclaration, ReactiveElement} from 'lit';

export interface EnumOptions<T> {
  defaultValue?: T;
  values: T[];
}

/**
 * Legacy version of the enum property decorator
 * @param {unknown} proto Prototype to decorate
 * @param {string} name Property to decorate
 * @param {EnumOptions} options Options to control allowed values
 * @param {PropertyDeclaration=} litOptions Property options for lit
 * @return {void}
 */
function legacyEnumProperty<T>(
  proto: object,
  name: PropertyKey,
  options: EnumOptions<T>,
  litOptions?: PropertyDeclaration
): void {
  const key = typeof name === 'symbol' ? Symbol() : `__${name}`;

  Object.defineProperty(proto.constructor.prototype, name, {
    get(): T {
      return (this as {[key: PropertyKey]: unknown})[key] as T;
    },
    set(this: ReactiveElement, value: unknown) {
      const validatedValue = options.values.includes(value as T)
        ? value
        : options.defaultValue;
      const oldValue = (this as unknown as {[key: PropertyKey]: unknown})[name];
      (this as unknown as {[key: PropertyKey]: unknown})[key] = validatedValue;
      (this as unknown as ReactiveElement).requestUpdate(name, oldValue, {
        ...litOptions,
        noAccessor: true
      });
    },
    configurable: true,
    enumerable: true
  });
  (proto.constructor as typeof ReactiveElement).createProperty(name, {
    ...litOptions,
    noAccessor: true
  });
}

/**
 * A property decorator which enforces selection from an enumeration of
 * possible values.
 *
 * @param {EnumOptions} options Options to control allowed values
 * @param {PropertyDeclaration=} litOptions Property options for lit
 * @return {unknown}
 */
export function enumProperty<T>(
  options: EnumOptions<T>,
  litOptions?: PropertyDeclaration
) {
  return (protoOrDescriptor: object, name: PropertyKey): void =>
    legacyEnumProperty(protoOrDescriptor as object, name, options, litOptions);
}
