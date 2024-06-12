import {ElementPart, noChange} from 'lit';
import {AsyncDirective, directive, PartType} from 'lit/async-directive.js';
import type {
  DirectiveParameters,
  DirectiveClass,
  DirectiveResult,
  PartInfo
} from 'lit/async-directive.js';

export type LongPressCallback = (event: PointerEvent) => void;

const DEFAULT_LONG_PRESS_TIMEOUT_MS: number = 1000;

/**
 * Calls a callback when the pointer has been held down for a specified
 * duration
 */
class LongPressDirective extends AsyncDirective {
  /** Element of the directive. */
  private __element?: Element;

  /**
   * Long press timeout.
   * This timeout initiates when the pointer is pressed on the
   * element. It calls user's callback unless cancel events occur
   * before time's out.
   */
  private __longPressTimer?: number;

  /** Time before the timeout runs out. */
  private __longPressTimeoutMs: number = DEFAULT_LONG_PRESS_TIMEOUT_MS;

  /** User-defined callback for long-press event */
  private __longPressCallback?: LongPressCallback;

  /** @inheritdoc */
  public constructor(partInfo: PartInfo) {
    super(partInfo);

    if (partInfo.type !== PartType.ELEMENT) {
      throw new Error(
        'The `onLongPress` directive must be used in an element binding'
      );
    }
  }

  /** @inheritdoc */
  public render(
    _callback: LongPressCallback,
    _callbackTimeoutMs?: number
  ): unknown {
    return noChange;
  }

  /** @inheritdoc */
  public override update(
    part: ElementPart,
    [callback, callbackTimeoutMs]: DirectiveParameters<this>
  ): unknown {
    if (part.element !== this.__element) {
      this.__setElement(part.element);
    }

    this.__longPressCallback = callback;
    this.__longPressTimeoutMs =
      callbackTimeoutMs ?? DEFAULT_LONG_PRESS_TIMEOUT_MS;

    return this.render(callback, callbackTimeoutMs);
  }

  /**
   * Sets the element and its handlers
   * @param {Element} element Element to set
   * @return {void}
   */
  private __setElement(element: Element) {
    // Detach events from previous element
    if (this.__element) {
      this.__removeListenersFromElement(this.__element);
    }
    this.__element = element;
    this.__addListenersToElement(element);
  }

  /**
   * Removes any associated listeners from the given element
   * @param {Element} node Element to remove listeners from
   * @return {void}
   */
  private __removeListenersFromElement(node: Element): void {
    // cast to get strongly typed events (sadtimes)
    const element = node as HTMLElement;
    element.removeEventListener('pointerdown', this.__onPointerDown);
    element.removeEventListener('pointerup', this.__onPointerUp);
    element.removeEventListener('pointerleave', this.__onPointerLeave);
  }

  /**
   * Adds any associated listeners to the given element
   * @param {Element} node Element to add listeners to
   * @return {void}
   */
  private __addListenersToElement(node: Element): void {
    // cast to get strongly typed events (sadtimes)
    const element = node as HTMLElement;
    element.addEventListener('pointerdown', this.__onPointerDown);
    element.addEventListener('pointerup', this.__onPointerUp);
    element.addEventListener('pointerleave', this.__onPointerLeave);
  }

  /**
   * Fired when the pointer is down/pressed
   * @param {PointerEvent} e Event fired
   * @return {void}
   */
  private __onPointerDown = (e: PointerEvent): void => {
    // TODO: When the mouse is released and long press event
    // was accepted, we should find a way to cancel the @click
    // event listener if it exists.
    this.__initiateTimer(e);
  };

  /**
   * Fired when the pointer is up/released
   * @return {void}
   */
  private __onPointerUp = (): void => {
    this.__clearTimer();
  };

  /**
   * Fired when the pointer leaves the host
   * @return {void}
   */
  private __onPointerLeave = (): void => {
    this.__clearTimer();
  };

  /**
   * Start the long press timeout.
   * @returns {void}
   */
  private __initiateTimer(e: PointerEvent): void {
    this.__longPressTimer = setTimeout(() => {
      if (this.__longPressCallback) {
        this.__longPressCallback(e);
      }
    }, this.__longPressTimeoutMs);
  }

  /**
   * Cancel the long press timeout.
   * This function is called when the user releases the mouse
   * or when the mouse leaves the element.
   * @return {void}
   */
  private __clearTimer(): void {
    clearTimeout(this.__longPressTimer);
  }

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

const onLongPressDirective = directive(LongPressDirective);

/**
 * Calls the `callback` function when the user has held their pointer down
 * for the specified duration (default 1s).
 *
 * For example:
 *
 * ```ts
 * html`
 *  <div ${onLongPress(fn)}>Long press me!</div>
 * `;
 * ```
 *
 * @param {LongPressCallback} callback Function to call on long press
 * @param {number=} callbackTimeoutMs Time to wait before considering the event
 * to be a long press
 * @return {DirectiveResult}
 */
export function onLongPress(
  callback: LongPressCallback,
  callbackTimeoutMs?: number
): DirectiveResult<DirectiveClass> {
  return onLongPressDirective(callback, callbackTimeoutMs);
}
