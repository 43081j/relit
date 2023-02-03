import {directive, AsyncDirective} from 'lit/async-directive.js';
import {nothing} from 'lit';
import type {
  ElementPart,
  DirectiveParameters,
  PartInfo,
  DirectiveResult,
  DirectiveClass
} from 'lit/directive.js';
import {PartType} from 'lit/directive.js';

type PropertyLike = string | symbol | number;

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
class BindInputDirective extends AsyncDirective {
  private __element?: Element;
  private __prop?: PropertyLike;
  private __host: unknown | undefined = undefined;
  private __lastValue: unknown = undefined;

  /** @inheritdoc */
  public constructor(partInfo: PartInfo) {
    super(partInfo);

    if (partInfo.type !== PartType.ELEMENT) {
      throw new Error(
        'The `bindInput` directive must be used in an element binding'
      );
    }
  }

  /** @inheritdoc */
  public render(_host: unknown, _prop: PropertyLike): typeof nothing {
    return nothing;
  }

  /** @inheritdoc */
  public override update(
    part: ElementPart,
    [host, prop]: DirectiveParameters<this>
  ): void {
    if (part.element !== this.__element) {
      this.__setElement(part.element);
    }

    if (prop !== this.__prop) {
      this.__prop = prop;
    }

    if (host !== this.__host) {
      this.__host = host;
    }

    if (host) {
      this.__updateValueFromHost(host);
    }
  }

  /**
   * Updates the value based on the host's current value for the given
   * property
   * @param {unknown} host Host to retrieve value from
   * @return {void}
   */
  private __updateValueFromHost(host: unknown): void {
    if (
      !this.__prop ||
      !host ||
      typeof host !== 'object' ||
      !(this.__prop in host) ||
      !this.__element
    ) {
      return;
    }

    const value = (host as Record<PropertyLike, unknown>)[this.__prop];
    const element = this.__element;

    if (value === this.__lastValue) {
      return;
    }

    this.__lastValue = value;

    if (isInputElement(element)) {
      if (element.type === 'checkbox') {
        element.checked = value === true;
      } else {
        element.value = String(value);
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
        element.value = String(value);
      }
    } else if (isTextAreaElement(element)) {
      element.value = String(value);
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
    if (!this.__prop) {
      return;
    }

    if (
      !this.__host ||
      typeof this.__host !== 'object' ||
      !(this.__prop in this.__host)
    ) {
      return;
    }

    const value = this.__getValueFromElement(element);

    this.__lastValue = value;

    (this.__host as Record<PropertyLike, unknown>)[this.__prop] = value;
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
 * @return {DirectiveResult}
 */
export function bindInput<T, TKey extends keyof T>(
  host: T,
  key: TKey
): DirectiveResult<DirectiveClass> {
  return bindInputDirective(host, key);
}
