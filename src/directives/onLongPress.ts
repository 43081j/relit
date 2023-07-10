import {ElementPart, noChange} from 'lit';
import {AsyncDirective, directive, PartType} from 'lit/async-directive.js';
import type {
  DirectiveParameters,
  DirectiveClass,
  DirectiveResult,
  PartInfo
} from 'lit/async-directive.js';

type LongPressCallback = (event?: PointerEvent) => void;

const DEFAULT_LONG_PRESS_TIMEOUT_MS = 1000 as number;

class LongPressDirective extends AsyncDirective {
  /** Element of the directive. */
  #element?: Element;

  /**
   * Long press timeout.
   * This timeout initiates when the pointer is pressed on the
   * element. It calls user's callback unless cancel events occur
   * before time's out.
   */
  #longPressTimeout?: number;

  /** Time before the timeout runs out. */
  #longPressTimeoutMs?: number | undefined;

  /** User-defined callback for long-press event */
  #longPressCallback?: LongPressCallback;

  /** @inheritdoc */
  public constructor(partInfo: PartInfo) {
    super(partInfo);
    if (partInfo.type !== PartType.ELEMENT) {
      throw new Error(
        'The `onlongPress` directive must be used in an element binding'
      );
    }
    this.#updateElement((partInfo as ElementPart).element);
  }

  /** @inheritdoc */
  public render(
    _callback: LongPressCallback,
    _callbackTimeoutMs: number = DEFAULT_LONG_PRESS_TIMEOUT_MS
  ): unknown {
    return noChange;
  }

  /** @inheritdoc */
  public override update(
    part: ElementPart,
    [callback, callbackTimeoutMs]: DirectiveParameters<this>
  ): unknown {
    if (part.element !== this.#element) {
      this.#updateElement(part.element);
    }
    this.#longPressCallback = callback;
    this.#longPressTimeoutMs = callbackTimeoutMs;
    return this.render(callback, callbackTimeoutMs);
  }

  #updateElement(element: Element) {
    // Detach events from previous element
    if (this.#element) {
      this.#detachEvents(this.#element);
    }
    this.#element = element;
    this.#attachEvents(element);
  }

  #attachEvents(node: Element) {
    node.addEventListener('pointerdown', this.#onPointerDown);
    node.addEventListener('pointerup', this.#onPointerUp);
    node.addEventListener('pointerleave', this.#onPointerLeave);
  }

  #detachEvents(node: Element) {
    node.removeEventListener('pointerdown', this.#onPointerDown);
    node.removeEventListener('pointerup', this.#onPointerUp);
    node.removeEventListener('pointerleave', this.#onPointerLeave);
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
  #initiateTimeout(e: Event): void {
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
  #cancelTimeout(): void {
    clearTimeout(this.#longPressTimeout);
  }

  /**
   * Abort the long press timeout on special occasions.
   * @returns {void}
   */
  #abort(): void {
    this.#cancelTimeout();
  }

  /** @inheritdoc */
  protected override disconnected(): void {
    if (this.#element) {
      this.#detachEvents(this.#element);
    }
  }

  /** @inheritdoc */
  protected override reconnected(): void {
    if (this.#element) {
      this.#attachEvents(this.#element);
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
