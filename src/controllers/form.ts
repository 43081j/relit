import type {ReactiveController, ReactiveControllerHost} from 'lit';
import {ref, createRef} from 'lit/directives/ref.js';
import type {DirectiveResult} from 'lit/directive.js';
import type {Ref, RefDirective} from 'lit/directives/ref.js';
import delve from 'dlv';
import {dset} from 'dset';

/**
 * Determines the field name of a given event target
 * @param {EventTarget} target Target to retrieve name of
 * @return {string|null}
 */
function getNameFromTarget(target: EventTarget): string | null {
  const node = target as Element;
  const name = node.getAttribute('name');
  const id = node.getAttribute('id');

  if (name) {
    return name;
  }

  if (id) {
    return id;
  }

  return null;
}

/**
 * Determines if an event target is an element
 * @param {EventTarget} target Target to check
 * @return {boolean}
 */
function isElementNode(target: EventTarget): target is HTMLElement {
  return (target as Node).nodeType === Node.ELEMENT_NODE;
}

/**
 * Gets the value of a given event target
 * @param {EventTarget} target Target to retrieve value from
 * @return {unknown}
 */
function getValueFromTarget(target: EventTarget): unknown {
  if (!isElementNode(target)) {
    return undefined;
  }

  const type = target.getAttribute('type');
  const possibleValue = (target as HTMLElement & {value: unknown}).value;

  if (!type) {
    return possibleValue;
  }

  if (type === 'number' || type === 'range') {
    const asNumber = Number(possibleValue);
    return Number.isNaN(asNumber) ? undefined : asNumber;
  }

  if (type === 'checkbox') {
    const checked = (target as HTMLInputElement).checked;
    // TODO (jg): handle arrays of checkboxes
    return checked === true;
  }

  if (target.nodeName === 'SELECT') {
    const options = (target as HTMLSelectElement).options;
    const multiple = target.hasAttribute('multiple');

    if (options && multiple) {
      return Array.from(options)
        .filter((option) => option.selected)
        .map((option) => option.value);
    }
  }

  return possibleValue;
}

export interface FormControllerOptions {
  immutable?: boolean;
}

/**
 * Forms
 */
export class FormController<T extends object> {
  private __host: ReactiveControllerHost;
  private __formRef: Ref<HTMLFormElement> = createRef<HTMLFormElement>();
  private __options: FormControllerOptions;

  public errors: Map<keyof T, string> = new Map<keyof T, string>();
  public value: T;

  /**
   * Gets the currently attached form element
   * @return {HTMLFormElement|undefined}
   */
  public get form(): HTMLFormElement | undefined {
    return this.__formRef.value;
  }

  /**
   * @param {ReactiveControllerHost} host Host to attach to
   * @param {T} initialValue Initial value to set
   * @param {FormOptions=} options Form options
   */
  public constructor(
    host: ReactiveControllerHost,
    initialValue: T,
    options: FormControllerOptions = {}
  ) {
    this.__host = host;
    this.__options = options;
    this.value = initialValue;
    host.addController(this as ReactiveController);
  }

  /**
   * Call when a change occurs from a field
   * @param {Event} ev Event fired
   * @return {void}
   */
  public onChange = (ev: Event): void => {
    this.__updateFromEvent(ev);
  };

  /**
   * Call when a field loses focus
   * @param {Event} _ev Event fired
   * @return {void}
   */
  public onBlur = (_ev: Event): void => {
    return;
  };

  /**
   * Call when input occurs in a field
   * @param {Event} ev Event fired
   * @return {void}
   */
  public onInput = (ev: Event): void => {
    this.__updateFromEvent(ev);
  };

  /**
   * Updates the model based on a change-like event
   * @param {Event} ev Event fired
   * @return {void}
   */
  private __updateFromEvent(ev: Event): void {
    if (!ev.currentTarget) {
      return;
    }

    const fieldName = getNameFromTarget(ev.currentTarget);

    if (fieldName === null) {
      return;
    }

    const currentValue = delve(this.value, fieldName);
    const newValue = getValueFromTarget(ev.currentTarget);

    if (currentValue !== newValue) {
      let value: T;

      if (this.__options.immutable) {
        value = window.structuredClone(this.value);
      } else {
        value = this.value;
      }

      dset(value, fieldName, newValue);

      this.value = value;

      this.__host.requestUpdate();
    }
  }

  /**
   * Attaches the controller to a `<form>` element
   * @return {DirectiveResult}
   */
  public attach(): DirectiveResult<typeof RefDirective> {
    return ref(this.__formRef);
  }
}
