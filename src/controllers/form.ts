import type {ReactiveController, ReactiveControllerHost} from 'lit';
import {ref, createRef} from 'lit/directives/ref.js';
import type {DirectiveResult} from 'lit/directive.js';
import type {Ref, RefDirective} from 'lit/directives/ref.js';
import {bindInput, type BindInputDirective} from '../directives/bindInput.js';

/**
 * Forms
 */
export class FormController<T extends object> {
  private __host: ReactiveControllerHost;
  private __formRef: Ref<HTMLFormElement> = createRef<HTMLFormElement>();

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
      host: this.__host
    });
  }

  /**
   * Attaches the controller to a `<form>` element
   * @return {DirectiveResult}
   */
  public attach(): DirectiveResult<typeof RefDirective> {
    return ref(this.__formRef);
  }
}
