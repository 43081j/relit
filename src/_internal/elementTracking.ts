import type {ReactiveController, ReactiveControllerHost} from 'lit';
import type {Ref} from 'lit/directives/ref.js';

/**
 * Used to track an element's reference throughout the rendering
 * lifecycle.
 */
export class ElementTrackingController implements ReactiveController {
  protected _host: ReactiveControllerHost & Element;
  private __ref?: Ref;
  private __currentElement: Element | undefined = undefined;

  /**
   * Gets the current element being tracked
   * @return {Element|undefined}
   */
  protected get _element(): Element | undefined {
    if (this.__ref) {
      return this.__ref.value;
    }
    return this._host;
  }

  /**
   * @param {Element} host Host element of this
   * controller
   * @param {Ref=} ref Ref to observe rather than the host element
   */
  public constructor(host: ReactiveControllerHost & Element, ref?: Ref) {
    this._host = host;
    if (ref) {
      this.__ref = ref;
    }
  }

  /** @inheritdoc */
  public hostUpdated(): void {
    const element = this._element;
    if (element !== this.__currentElement) {
      this.__currentElement = element;
      this._onElementChanged();
    }
  }

  /**
   * Fired when the current observed element changed
   * @return {void}
   */
  protected _onElementChanged(): void {
    return;
  }
}
