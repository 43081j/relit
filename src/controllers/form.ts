import type {ReactiveController, ReactiveControllerHost} from 'lit';
import {ref, createRef} from 'lit/directives/ref.js';
import type {DirectiveResult} from 'lit/directive.js';
import type {Ref, RefDirective} from 'lit/directives/ref.js';
import {bindInput, type BindInputDirective} from '../directives/bindInput.js';

export interface FormError {
  prop: PropertyKey;
  message: string;
}

export type FormFieldValidator<T> = (val: T) => string | null | void;

export type FormValidator<T> = (val: T) => FormError[] | FormError | null;

/**
 * Forms
 */
export class FormController<T extends object> {
  private __host: ReactiveControllerHost;
  private __formRef: Ref<HTMLFormElement> = createRef<HTMLFormElement>();
  private __fieldValidators: Map<
    PropertyKey,
    Set<FormFieldValidator<unknown>>
  > = new Map<PropertyKey, Set<FormFieldValidator<unknown>>>();
  private __validators: Set<FormValidator<T>> = new Set<FormValidator<T>>();

  public readonly errors: Map<PropertyKey, string> = new Map<
    PropertyKey,
    string
  >();
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
   */
  public constructor(host: ReactiveControllerHost, initialValue: T) {
    this.value = initialValue;
    this.__host = host;
    host.addController(this as ReactiveController);
  }

  /**
   * Binds an input to this form
   * @param {string} path Path to bind to in the value
   * @return {DirectiveResult}
   */
  public bind(path: string): DirectiveResult<typeof BindInputDirective> {
    return bindInput(this.value, path, {
      host: this.__host,
      validate: this.__validateInput
    });
  }

  /**
   * Adds a form-level validator to the form.
   * The validator is given the entire form value each time user input
   * is received
   * @param {FormValidator<T>} validator Validation function
   * @return {void}
   */
  public addValidator(validator: FormValidator<T>): void;

  /**
   * Adds a field-level validator to the form.
   * The validator is given the field's value each time user input is
   * received
   * @param {PropertyKey} prop Property to validate
   * @param {FormFieldValidator} validator Validation function
   * @return {void}
   */
  public addValidator<TKey extends keyof T>(
    prop: TKey,
    validator: FormFieldValidator<T[TKey]>
  ): void;

  /**
   * Adds a field-level validator to the form.
   * The validator is given the field's value each time user input is
   * received
   * @param {PropertyKey} prop Property to validate
   * @param {FormFieldValidator} validator Validation function
   * @return {void}
   */
  public addValidator(
    prop: PropertyKey,
    validator: FormFieldValidator<unknown>
  ): void;

  /**
   * Adds a validator to the form
   * @param {PropertyKey|FormValidator<T>} propOrValidator Property or
   * validator
   * @param {FormFieldValidator=} validator Validation function if a property
   * was specified
   * @return {void}
   */
  public addValidator(
    propOrValidator: PropertyKey | FormValidator<T>,
    validator?: FormFieldValidator<unknown>
  ): void {
    if (typeof propOrValidator === 'function') {
      this.__validators.add(propOrValidator);
    } else {
      const validators =
        this.__fieldValidators.get(propOrValidator) ??
        new Set<FormFieldValidator<unknown>>();
      if (validator) {
        validators.add(validator);
      }
      this.__fieldValidators.set(propOrValidator, validators);
    }
  }

  /**
   * Validates a specified property using the form's validators
   * @param {unknown} val Value to validate
   * @param {PropertyKey} prop Property being validated
   * @return {boolean}
   */
  private __validateInput = (val: unknown, prop: PropertyKey): boolean => {
    let valid = true;

    for (const validator of this.__validators) {
      const result = validator(this.value);

      if (result) {
        const asArr = Array.isArray(result) ? result : [result];
        for (const err of asArr) {
          if (err.prop === prop) {
            valid = false;
          }
          this.errors.set(err.prop, err.message);
        }
      }
    }

    const fieldValidators = this.__fieldValidators.get(prop);

    if (fieldValidators) {
      for (const validator of fieldValidators) {
        const result = validator(val);
        if (result) {
          valid = false;
          this.errors.set(prop, result);
        }
      }
    }

    return valid;
  };

  /**
   * Attaches the controller to a `<form>` element
   * @return {DirectiveResult}
   */
  public attach(): DirectiveResult<typeof RefDirective> {
    return ref(this.__formRef);
  }
}
