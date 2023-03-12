import type {ReactiveControllerHost, ReactiveController} from 'lit';
import type {Ref} from 'lit/directives/ref.js';

/**
 * Determines if a node is a slot element
 * @param {Element} node Node to test
 * @return {boolean}
 */
function isSlotElement(node: Element): node is HTMLSlotElement {
  return node.nodeName === 'SLOT';
}

const defaultSlotName = '[default]';

/**
 * Determines if a given slot string/ref matches the specified slot
 * @param {HTMLSlotElement} node Node to test against
 * @param {string|Ref} matcher Ref or selector to match
 * @return {boolean}
 */
function slotMatches(
  node: HTMLSlotElement,
  matcher: string | Ref<HTMLSlotElement>
): boolean {
  if (matcher === defaultSlotName && !node.hasAttribute('name')) {
    return true;
  }

  if (typeof matcher !== 'string') {
    return matcher.value === node;
  }

  return matcher === node.name;
}

/**
 * Determines the slot name from a string or ref
 * @param {string|Ref} slot Slot to retrieve name from
 * @return {string|null}
 */
function getSlotName(slot: string | Ref<HTMLSlotElement>): string | null {
  if (typeof slot === 'string') {
    return slot;
  }
  if (!slot.value) {
    return null;
  }
  return slot.value.name || '[default]';
}

type SlotListenerCallback<T extends Element> = (node: T) => void;

export interface HasOptions {
  flatten?: boolean;
}

interface SlotListener {
  slot: string | Ref<HTMLSlotElement>;
  selector: string;
  callback: SlotListenerCallback<Element>;
}

/**
 * Helpers for dealing with slotted content
 */
export class SlotController implements ReactiveController {
  private __host: ReactiveControllerHost & Element;
  private __hasCalled: boolean = false;
  private __listeners: Set<SlotListener> = new Set<SlotListener>();

  /**
   * Gets the slot elements in the current host
   * @return {HTMLSlotElement[]}
   */
  private get __slots(): HTMLSlotElement[] {
    if (!this.__host.shadowRoot) {
      return [];
    }

    return [...this.__host.shadowRoot.querySelectorAll('slot')];
  }

  /**
   * @param {ReactiveControllerHost} host Host to attach to
   */
  public constructor(host: ReactiveControllerHost & Element) {
    this.__host = host;

    host.addController(this);
  }

  /**
   * Determines if a given slot has contents in the host
   * @param {string|Ref} slot Slot to test against, * for all slots
   * @param {string} selector Selector to test
   * @param {object} options Options for detection
   * @return {boolean}
   */
  public has(
    slot: string | Ref<HTMLSlotElement>,
    selector?: string,
    options?: HasOptions
  ): boolean {
    const slotName = getSlotName(slot);
    const flatten = options?.flatten === true;

    this.__hasCalled = true;

    if (!slotName) {
      return false;
    }

    const slots = this.__slots.filter((slot) => {
      return (
        slotName === '*' ||
        (!slot.hasAttribute('name') && slotName === defaultSlotName) ||
        slot.name === slotName
      );
    });

    for (const slot of slots) {
      for (const child of slot.assignedElements({flatten})) {
        // If there's no selector, return as soon as we've seen a child.
        // Otherwise, return once we see a matching child.
        if (!selector || child.matches(selector)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Binds a function to be called any time elements matching the specified
   * selector are slotted into a given slot
   * @param {string|Ref} slot Slot to observe, * for all slots
   * @param {string} selector Query selector to filter elements by. Set this
   * to `*` for all elements
   * @param {SlotListenerCallback} callback Callback to call
   * @return {void}
   */
  public addListener<T extends keyof HTMLElementTagNameMap>(
    slot: string | Ref<HTMLSlotElement>,
    selector: T,
    callback: SlotListenerCallback<HTMLElementTagNameMap[T]>
  ): void;

  /** @inheritdoc */
  public addListener(
    slot: string | Ref<HTMLSlotElement>,
    selector: string,
    callback: SlotListenerCallback<Element>
  ): void;

  /** @inheritdoc */
  public addListener(
    slot: string | Ref<HTMLSlotElement>,
    selector: string,
    callback: SlotListenerCallback<Element>
  ): void {
    this.__listeners.add({
      slot,
      selector,
      callback
    });
  }

  /**
   * Fired when a slot change event occurred
   * @param {Event} ev Event fired
   * @return {void}
   */
  private __onSlotChanged = (ev: Event): void => {
    const element = ev.target as Element;

    if (!isSlotElement(element)) {
      return;
    }

    const nodes = element.assignedElements();

    for (const listener of this.__listeners) {
      if (listener.slot !== '*' && !slotMatches(element, listener.slot)) {
        continue;
      }

      for (const node of nodes) {
        if (listener.selector === '*' || node.matches(listener.selector)) {
          listener.callback(node);
        }
      }
    }

    if (this.__hasCalled) {
      this.__host.requestUpdate();
    }
  };

  /** @inheritdoc */
  public hostUpdate(): void {
    this.__hasCalled = false;
  }

  /** @inheritdoc */
  public hostConnected(): void {
    this.__host.shadowRoot?.addEventListener(
      'slotchange',
      this.__onSlotChanged
    );
  }

  /** @inheritdoc */
  public hostDisconnected(): void {
    this.__host.shadowRoot?.removeEventListener(
      'slotchange',
      this.__onSlotChanged
    );
  }
}
