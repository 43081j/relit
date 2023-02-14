import type {ReactiveControllerHost} from 'lit';
import type {Ref} from 'lit/directives/ref.js';
import {createRef} from 'lit/directives/ref.js';
import {ElementTrackingController} from '../_internal/elementTracking.js';

/**
 * Determines if a node is a slot element
 * @param {Element} node Node to test
 * @return {boolean}
 */
function isSlotElement(node: Element): node is HTMLSlotElement {
  return node.nodeName === 'SLOT';
}

type SlotListenerCallback<T extends Element> = (node: T) => void;

interface SlotListener {
  selector: string;
  callback: SlotListenerCallback<Element>;
}

/**
 * Helpers for dealing with slotted content
 */
export class SlotController extends ElementTrackingController {
  /**
   * Gets the current ref
   * @return {Ref}
   */
  public get ref(): Ref {
    // Casting here to drop the nullability
    return this._ref as Ref;
  }

  /**
   * @param {ReactiveControllerHost} host Host to attach to
   * @param {Ref} ref Ref to observe rather than the host element
   */
  public constructor(
    host: ReactiveControllerHost & Element,
    ref: Ref = createRef()
  ) {
    super(host, ref);

    host.addController(this);
  }

  private __listeners: Set<SlotListener> = new Set<SlotListener>();

  /**
   * Binds a function to be called any time elements matching the specified
   * selector are slotted into the slot
   * @param {string} selector Query selector to filter elements by. Set this
   * to `*` for all elements
   * @param {SlotListenerCallback} callback Callback to call
   * @return {void}
   */
  public addListener<T extends keyof HTMLElementTagNameMap>(
    selector: T,
    callback: SlotListenerCallback<HTMLElementTagNameMap[T]>
  ): void;

  /** @inheritdoc */
  public addListener(
    selector: string,
    callback: SlotListenerCallback<Element>
  ): void;

  /** @inheritdoc */
  public addListener(
    selector: string,
    callback: SlotListenerCallback<Element>
  ): void {
    this.__listeners.add({
      selector,
      callback
    });
  }

  /**
   * Fired when a slot change event occurred
   * @return {void}
   */
  private __onSlotChanged = (): void => {
    const element = this._element;

    if (!element || !isSlotElement(element)) {
      return;
    }

    const nodes = element.assignedElements();

    for (const listener of this.__listeners) {
      for (const node of nodes) {
        if (listener.selector === '*' || node.matches(listener.selector)) {
          listener.callback(node);
        }
      }
    }
  };

  /** @inheritdoc */
  protected override _onElementChanged(prevElement: Element | undefined): void {
    super._onElementChanged(prevElement);

    if (prevElement) {
      prevElement.removeEventListener('slotchange', this.__onSlotChanged);
    }

    const element = this._element;

    if (element) {
      element.addEventListener('slotchange', this.__onSlotChanged);
    }
  }
}
