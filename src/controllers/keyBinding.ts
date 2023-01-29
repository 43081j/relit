import type {ReactiveControllerHost} from 'lit';
import type {Ref} from 'lit/directives/ref.js';
import {ElementTrackingController} from '../_internal/elementTracking.js';

export type KeyBindingHandler = (ev: KeyboardEvent) => void;
export type KeyBindingTrigger = 'keydown' | 'keyup' | 'firstKeyDown';
export interface KeyBindingOptions {
  triggers?: KeyBindingTrigger[];
}

interface KeyBinding {
  keys: string[];
  handler: KeyBindingHandler;
  options?: KeyBindingOptions | undefined;
}

export interface KeyBindingGlobalOptions {
  ignoredElements?: string[];
}

const defaultOptions: KeyBindingGlobalOptions = {
  ignoredElements: ['textarea', 'input', 'select']
};

/**
 * Normalises the keys input to an array
 * @param {string|string[]} keys Keys to normalise
 * @return {string[]}
 */
function normaliseKeys(keys: string | string[]): string[] {
  return (Array.isArray(keys) ? keys : [keys]).map((k) => k.toLowerCase());
}

/**
 * Determines if an event target is an element
 * @param {EventTarget} node Node to test
 * @return {boolean}
 */
function isElement(node: EventTarget): node is Element {
  return (node as Element).nodeType === Node.ELEMENT_NODE;
}

/**
 * Enables key bindings in a host element
 */
export class KeyBindingController extends ElementTrackingController {
  private __bindings: Set<KeyBinding> = new Set<KeyBinding>();
  private __options: KeyBindingGlobalOptions;
  private __pressedKeys: Set<string> = new Set<string>();
  private __firstKeyDownHistory: WeakSet<KeyBinding> =
    new WeakSet<KeyBinding>();

  /**
   * @param {ReactiveControllerHost} host Host to attach to
   * @param {Ref=} ref Ref to observe rather than the host element
   * @param {KeyBindingGlobalOptions=} options Options for the controller
   */
  public constructor(
    host: ReactiveControllerHost & Element,
    ref?: Ref | null,
    options?: KeyBindingGlobalOptions
  ) {
    super(host, ref);

    this.__options = {
      ...defaultOptions,
      ...options
    };

    host.addController(this);
  }

  /**
   * Binds a key combination to a specified function
   * @param {string|string[]} key Key to bind, or key-combination if
   * it is an array.
   * @param {KeyBindingHandler} fn Callback function
   * @param {KeyBindingOptions=} options Options for binding
   * @return {void}
   */
  public bindKey(
    key: string | string[],
    fn: KeyBindingHandler,
    options?: KeyBindingOptions
  ): void {
    this.__bindings.add({
      keys: normaliseKeys(key),
      handler: fn,
      options
    });
  }

  /**
   * Binds a key combination to the focusing of a specified element
   * @param {string|string[]} key Key to bind, or key-combination if
   * it is an array.
   * @param {Ref} ref Element ref to focus on key press
   * @return {void}
   */
  public bindFocus(key: string | string[], ref: Ref): void {
    this.__bindings.add({
      keys: normaliseKeys(key),
      handler: () => this.__focusRef(ref)
    });
  }

  /**
   * Focuses a ref based on an event
   * @param {Ref} ref Ref to element to focus
   * @return {void}
   */
  private __focusRef(ref: Ref): void {
    if (ref.value) {
      const withFocus = ref.value as Element & {focus?: () => void};

      if (withFocus.focus) {
        withFocus.focus();
      }
    }
  }

  /**
   * Binds a key combination to behave like a "push and release" toggle.
   * For example, assuming we bound the `c` key, it means our
   * function would be called when we initially push it and when we
   * finally release it.
   * @param {string|string[]} key Key to bind, or key-combination if
   * it is an array.
   * @param {KeyBindingHandler} fn Callback function
   * @return {void}
   */
  public bindPush(key: string | string[], fn: KeyBindingHandler): void {
    this.__bindings.add({
      keys: normaliseKeys(key),
      handler: fn,
      options: {
        triggers: ['firstKeyDown', 'keyup']
      }
    });
  }

  /**
   * Handles a keyboard event by executing any matching bindings
   * @param {KeyboardEvent} ev Event fired
   * @return {void}
   */
  private __handleEvent(ev: KeyboardEvent): void {
    const key = ev.key.toLowerCase();
    const path = ev.composedPath();
    const ignoredElements = this.__options?.ignoredElements;

    if (!this._element || !path.includes(this._element)) {
      return;
    }

    if (ignoredElements) {
      const isIgnored = path.some(
        (target) =>
          isElement(target) &&
          ignoredElements.some((selector) => target.matches(selector))
      );

      if (isIgnored) {
        return;
      }
    }

    if (ev.type === 'keydown') {
      this.__pressedKeys.add(key);
    }

    for (const binding of this.__bindings) {
      if (this.__bindingMatches(binding, ev)) {
        binding.handler.call(this._host, ev);
      }
    }

    if (ev.type === 'keyup') {
      this.__pressedKeys.delete(key);
    }
  }

  /**
   * Determines if a given key event matches a binding
   * @param {KeyBinding} binding Binding to test
   * @param {KeyboardEvent} ev Event fired
   * @return {boolean}
   */
  private __bindingMatches(binding: KeyBinding, ev: KeyboardEvent): boolean {
    const triggers = binding.options?.triggers ?? ['keyup'];
    const keysMatch = binding.keys.every((key) => this.__pressedKeys.has(key));

    if (!keysMatch) {
      return false;
    }

    if (ev.type === 'keydown') {
      if (triggers.includes('keydown')) {
        return true;
      }

      if (triggers.includes('firstKeyDown')) {
        if (this.__firstKeyDownHistory.has(binding)) {
          return false;
        }

        this.__firstKeyDownHistory.add(binding);
        return true;
      }
    }

    if (ev.type === 'keyup') {
      this.__firstKeyDownHistory.delete(binding);

      if (triggers.includes('keyup')) {
        return true;
      }
    }

    return false;
  }

  /**
   * Fired on keyup of the host
   * @param {KeyboardEvent} ev Event fired
   * @return {void}
   */
  private __onKeyUp = (ev: Event): void => {
    const keyEvent = ev as KeyboardEvent;
    this.__handleEvent(keyEvent);
  };

  /**
   * Fired on keydown of the host
   * @param {KeyboardEvent} ev Event fired
   * @return {void}
   */
  private __onKeyDown = (ev: Event): void => {
    const keyEvent = ev as KeyboardEvent;
    this.__handleEvent(keyEvent);
  };

  /** @inheritdoc */
  public hostConnected(): void {
    this._host.addEventListener('keyup', this.__onKeyUp);
    this._host.addEventListener('keydown', this.__onKeyDown);
  }

  /** @inheritdoc */
  public hostDisconnected(): void {
    this._host.removeEventListener('keyup', this.__onKeyUp);
    this._host.removeEventListener('keydown', this.__onKeyDown);
  }
}
