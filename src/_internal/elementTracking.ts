import type {ReactiveController, ReactiveControllerHost} from 'lit';
import type {Ref} from 'lit/directives/ref.js';

/**
 * Used to track an element's reference throughout the rendering
 * lifecycle.
 */
export class ElementTrackingController implements ReactiveController {
  protected _host: ReactiveControllerHost & Element;
  protected _ref?: Ref;
  private __currentElement: Element | undefined = undefined;

  /**
   * Gets the current element being tracked
   * @return {Element|undefined}
   */
  protected get _element(): Element | undefined {
    if (this._ref) {
      return this._ref.value;
    }
    return this._host;
  }

  /**
   * @param {Element} host Host element of this
   * controller
   * @param {Ref=} ref Ref to observe rather than the host element
   */
  public constructor(host: ReactiveControllerHost & Element, ref?: Ref | null) {
    this._host = host;
    if (ref) {
      this._ref = ref;
    }
  }

  /** @inheritdoc */
  public hostUpdated(): void {
    const element = this._element;
    const prevElement = this.__currentElement;
    if (element !== prevElement) {
      this.__currentElement = element;
      this._onElementChanged(prevElement);
    }
  }

  /**
   * Fired when the current observed element changed
   * @param {Element|undefined} _previousElement Previous element before it
   * changed
   * @return {void}
   */
  protected _onElementChanged(_previousElement: Element | undefined): void {
    return;
  }
}
