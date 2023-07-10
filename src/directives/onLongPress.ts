import {ElementPart, nothing} from 'lit';
import {AsyncDirective, directive, PartType} from 'lit/async-directive.js';
import type {
  DirectiveParameters,
  DirectiveClass,
  DirectiveResult,
  PartInfo
} from 'lit/async-directive.js';

type LongPressCallback = (event?: PointerEvent) => void;

const DEFAULT_LONG_PRESS_TIMEOUT_MS = 1000;

class LongPressDirective extends AsyncDirective {
  /** Element of the directive. */
  #element?: Element;

  /**
   * Long press timeout.
   * This timeout initiates when the pointer is pressed on the
   * element. It calls user's callback unless cancel events occur
   * before time's out.
   */
  #longPressTimeout?: NodeJS.Timeout;

  /** Time before the timeout runs out. */
  #longPressTimeoutMs?: number | undefined;

  /** User-defined callback for long-press event */
  #longPressCallback?: LongPressCallback;

  constructor(partInfo: PartInfo) {
    super(partInfo);
    if (partInfo.type !== PartType.ELEMENT) {
      throw new Error(
        "Can't bind `onLongPress` directive to anything " +
          'that is not an element.'
      );
    }
    this.#updateElement((partInfo as ElementPart).element);
  }

  /** @inheritdoc */
  public render(
    callback: LongPressCallback,
    callbackTimeoutMs = DEFAULT_LONG_PRESS_TIMEOUT_MS
  ) {
    this.#longPressCallback = callback;
    this.#longPressTimeoutMs = callbackTimeoutMs;

    return nothing;
  }

  /** @inheritdoc */
  public override update(
    part: ElementPart,
    [callback, callbackTimeoutMs]: DirectiveParameters<this>
  ): void {
    this.render(callback, callbackTimeoutMs);
    if (part.element !== this.#element) {
      this.#updateElement(part.element);
    }
  }

  #updateElement(element: Element) {
    // Detach events from previous element
    if (this.#element !== undefined) {
      this.#detachEvents();
    }
    this.#element = element;
    this.#attachEvents();
  }

  #attachEvents() {
    if (this.#element !== undefined) {
      this.#element.addEventListener('pointerdown', this.#onPointerDown);
      this.#element.addEventListener('pointerup', this.#onPointerUp);
      this.#element.addEventListener('pointerleave', this.#onPointerLeave);
    }
  }

  #detachEvents() {
    if (this.#element !== undefined) {
      this.#element.removeEventListener('pointerdown', this.#onPointerDown);
      this.#element.removeEventListener('pointerup', this.#onPointerUp);
      this.#element.removeEventListener('pointerleave', this.#onPointerLeave);
    }
  }

  // TODO: When the mouse is released and long press event
  // was accepted, we should find a way to cancel the @click
  // event listener if it exists.
  #onPointerDown = (e: Event): void => this.#initiateTimeout(e);
  #onPointerUp = (): void => this.#abort();
  #onPointerLeave = (): void => this.#abort();

  /**
   * Start the long press timeout.
   * @returns {void}
   */
  #initiateTimeout(e: Event) {
    this.#longPressTimeout = setTimeout(() => {
      this.#longPressCallback?.(e as PointerEvent);
    }, this.#longPressTimeoutMs ?? DEFAULT_LONG_PRESS_TIMEOUT_MS);
  }

  /**
   * Cancel the long press timeout.
   * This function is called when the user releases the mouse
   * or when the mouse leaves the element.
   * @return {void}
   */
  #cancelTimeout() {
    clearTimeout(this.#longPressTimeout);
  }

  /**
   * Abort the long press timeout on special occasions.
   * @returns {void}
   */
  #abort() {
    this.#cancelTimeout();
  }

  /** @inheritdoc */
  protected override disconnected(): void {
    if (this.#element) {
      this.#detachEvents();
    }
  }

  /** @inheritdoc */
  protected override reconnected(): void {
    if (this.#element) {
      this.#attachEvents();
    }
  }
}

const onLongPressDirective = directive(LongPressDirective);

export function onLongPress(
  callback: LongPressCallback,
  callbackTimeoutMs = DEFAULT_LONG_PRESS_TIMEOUT_MS
): DirectiveResult<DirectiveClass> {
  return onLongPressDirective(callback, callbackTimeoutMs);
}
