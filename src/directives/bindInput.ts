import {directive, AsyncDirective} from 'lit/async-directive.js';
import {nothing, type ReactiveControllerHost} from 'lit';
import type {
  ElementPart,
  DirectiveParameters,
  PartInfo,
  DirectiveResult,
  DirectiveClass
} from 'lit/directive.js';
import {PartType} from 'lit/directive.js';
import delve from 'dlv';
import {dset} from 'dset';

export interface BindInputOptions {
  host?: ReactiveControllerHost;
  validate?: (val: unknown, prop: PropertyKey) => boolean;
}

/**
 * Determines if a target is an element
 * @param {EventTarget} target Target to test
 * @return {boolean}
 */
function isElement(target: EventTarget): target is Element {
  return (target as Node).nodeType === Node.ELEMENT_NODE;
}

/**
 * Determines if a target is an input element
 * @param {EventTarget} target Target to test
 * @return {boolean}
 */
function isInputElement(target: EventTarget): target is HTMLInputElement {
  return isElement(target) && target.nodeName === 'INPUT';
}

/**
 * Determines if a target is a select element
 * @param {EventTarget} target Target to test
 * @return {boolean}
 */
function isSelectElement(target: EventTarget): target is HTMLSelectElement {
  return isElement(target) && target.nodeName === 'SELECT';
}

/**
 * Determines if a target is a textarea element
 * @param {EventTarget} target Target to test
 * @return {boolean}
 */
function isTextAreaElement(target: EventTarget): target is HTMLTextAreaElement {
  return isElement(target) && target.nodeName === 'TEXTAREA';
}

/**
 * Tracks the value of a form control and propagates data two-way to/from a
 * given host property.
 */
export class BindInputDirective extends AsyncDirective {
  private __element?: Element;
  private __prop?: PropertyKey;
  private __host: unknown | undefined = undefined;
  private __lastValue: unknown = undefined;
  private __isAttribute: boolean;
  private __options: BindInputOptions | undefined = undefined;

  /** @inheritdoc */
  public constructor(partInfo: PartInfo) {
    super(partInfo);

    if (
      partInfo.type !== PartType.ELEMENT &&
      partInfo.type !== PartType.ATTRIBUTE &&
      partInfo.type !== PartType.PROPERTY
    ) {
      throw new Error(
        'The `bindInput` directive must be used in an element or ' +
          'attribute binding'
      );
    }

    this.__isAttribute =
      partInfo.type === PartType.ATTRIBUTE ||
      partInfo.type === PartType.PROPERTY;
  }

  /** @inheritdoc */
  public render(
    host: unknown,
    prop: PropertyKey,
    _options?: BindInputOptions
  ): unknown {
    if (this.__isAttribute) {
      return this.__computeValueFromHost(host, prop);
    }
    return nothing;
  }

  /** @inheritdoc */
  public override update(
    part: ElementPart,
    [host, prop, options]: DirectiveParameters<this>
  ): unknown {
    if (part.element !== this.__element) {
      this.__setElement(part.element);
    }

    if (prop !== this.__prop) {
      this.__prop = prop;
    }

    if (host !== this.__host) {
      this.__host = host;
    }

    if (options !== this.__options) {
      this.__options = options;
    }

    if (host && !this.__isAttribute) {
      this.__updateValueFromHost(host);
    }

    return this.render(host, prop);
  }

  /**
   * Gets the value of the property from the host
   * @param {unknown} host Host to retrieve value from
   * @param {PropertyKey} prop Property to retrieve
   * @return {unknown}
   */
  private __computeValueFromHost(host: unknown, prop: PropertyKey): unknown {
    if (typeof prop === 'string') {
      return delve(host, prop);
    }

    if (typeof host !== 'object' || host === null || !(prop in host)) {
      return undefined;
    }

    return (host as Record<PropertyKey, unknown>)[prop];
  }

  /**
   * Updates the value based on the host's current value for the given
   * property
   * @param {unknown} host Host to retrieve value from
   * @return {void}
   */
  private __updateValueFromHost(host: unknown): void {
    if (!this.__prop || !this.__element) {
      return;
    }

    const value = this.__computeValueFromHost(host, this.__prop);
    const element = this.__element;

    if (value === this.__lastValue) {
      return;
    }

    this.__lastValue = value;

    if (isInputElement(element)) {
      if (element.type === 'checkbox') {
        element.checked = value === true;
      } else {
        element.value = String(value ?? '');
      }
    } else if (isSelectElement(element)) {
      if (element.multiple) {
        const valuesArray = Array.isArray(value) ? value : [value];

        for (const opt of element.options) {
          if (valuesArray.includes(opt.value)) {
            opt.selected = true;
          }
        }
      } else {
        element.value = String(value ?? '');
      }
    } else if (isTextAreaElement(element)) {
      element.value = String(value ?? '');
    } else if ('value' in element) {
      element.value = value;
    }
  }

  /**
   * Sets the element and its handlers
   * @param {Element} element Element to set
   * @return {void}
   */
  private __setElement(element: Element): void {
    if (this.__element) {
      this.__removeListenersFromElement(element);
    }

    this.__element = element;

    this.__addListenersToElement(element);
  }

  /**
   * Removes any associated listeners from the given element
   * @param {Element} element Element to remove listeners from
   * @return {void}
   */
  private __removeListenersFromElement(element: Element): void {
    element.removeEventListener('change', this.__onChange);
    element.removeEventListener('input', this.__onInput);
  }

  /**
   * Adds any associated listeners to the given element
   * @param {Element} element Element to add listeners to
   * @return {void}
   */
  private __addListenersToElement(element: Element): void {
    element.addEventListener('change', this.__onChange);
    element.addEventListener('input', this.__onInput);
  }

  /**
   * Fired when the change event occurs
   * @param {Event} ev Event fired
   * @return {void}
   */
  private __onChange = (ev: Event): void => {
    const target = ev.currentTarget;

    if (target !== this.__element) {
      return;
    }

    this.__updateValueFromElement(this.__element);
  };

  /**
   * Retrieves the value of a given element
   * @param {Element} element Element to retrieve value from
   * @return {unknown}
   */
  private __getValueFromElement(element: Element): unknown {
    let value: unknown = undefined;

    if (isInputElement(element)) {
      if (element.type === 'checkbox') {
        value = element.checked === true;
      } else if (element.type === 'range' || element.type === 'number') {
        value = Number(element.value);
      } else {
        value = element.value;
      }
    } else if (isSelectElement(element)) {
      if (element.multiple) {
        value = [...element.selectedOptions].map((opt) => opt.value);
      } else {
        value = element.value;
      }
    } else if (isTextAreaElement(element)) {
      value = element.value;
    } else if ('value' in element) {
      value = element.value;
    }

    return value;
  }

  /**
   * Updates the host value from an element
   * @param {Element} element Element to retrieve value from
   * @return {void}
   */
  private __updateValueFromElement(element: Element): void {
    if (!this.__prop || !this.__host || typeof this.__host !== 'object') {
      return;
    }

    const value = this.__getValueFromElement(element);

    if (
      this.__options?.validate &&
      !this.__options.validate(value, this.__prop)
    ) {
      return;
    }

    this.__lastValue = value;

    if (typeof this.__prop === 'string') {
      dset(this.__host, this.__prop, value);
    } else {
      (this.__host as Record<PropertyKey, unknown>)[this.__prop] = value;
    }

    if (this.__options?.host) {
      this.__options.host.requestUpdate();
    }
  }

  /**
   * Fired when the input event occurs
   * @param {Event} ev Event fired
   * @return {void}
   */
  private __onInput = (ev: Event): void => {
    const target = ev.currentTarget;

    if (target !== this.__element) {
      return;
    }

    this.__updateValueFromElement(this.__element);
  };

  /** @inheritdoc */
  public override reconnected(): void {
    if (this.__element) {
      this.__addListenersToElement(this.__element);
    }
  }

  /** @inheritdoc */
  public override disconnected(): void {
    if (this.__element) {
      this.__removeListenersFromElement(this.__element);
    }
  }
}

const bindInputDirective = directive(BindInputDirective);

export type BindInputKey<T> = keyof T | `${string}.${string}`;

/**
 * Two-way binds a given property to the input it is defined on.
 *
 * For example:
 *
 * ```ts
 * html`
 *  <input type="text" ${input(this, 'name')}>
 * `;
 * ```
 *
 * @param {T} host Host object of the property
 * @param {string} key Property to bind
 * @param {BindInputOptions=} options Input binding options
 * @return {DirectiveResult}
 */
export function bindInput<T, TKey extends BindInputKey<T>>(
  host: T,
  key: TKey,
  options?: BindInputOptions
): DirectiveResult<DirectiveClass> {
  return bindInputDirective(host, key, options);
}
