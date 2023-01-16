import type {ReactiveController, ReactiveControllerHost} from 'lit';
import type {Ref} from 'lit/directives/ref.js';
import {ElementTrackingController} from '../_internal/elementTracking.js';

/**
 * Tracks the visibility of an element
 */
export class ElementVisibilityController extends ElementTrackingController {
  public visible: boolean = true;

  private __boundOnScroll: () => void;

  /**
   * @param {ReactiveControllerHost} host Host to attach to
   * @param {Ref=} ref Ref to observe instead of the host element
   */
  public constructor(host: ReactiveControllerHost & Element, ref?: Ref) {
    super(host, ref);

    this.__boundOnScroll = this.__onScroll.bind(this);
    this.visible = this.__computeVisibility();

    host.addController(this as ReactiveController);
  }

  /**
   * Fired when a scroll event occurs
   * @return {void}
   */
  private __onScroll(): void {
    this.visible = this.__computeVisibility();

    this._host.requestUpdate();
  }

  /**
   * Computes the visibility of the element
   * @return {boolean}
   */
  private __computeVisibility(): boolean {
    const element = this._element;

    // Somehow the element doesn't exist, so leave the flag unchanged
    if (!element) {
      return this.visible;
    }

    const rect = element.getBoundingClientRect();

    return (
      rect.top <= window.innerHeight &&
      rect.left <= window.innerWidth &&
      rect.bottom >= 0 &&
      rect.right >= 0
    );
  }

  /** @inheritdoc */
  public hostConnected(): void {
    window.document.addEventListener('scroll', this.__boundOnScroll, {
      passive: true
    });
  }

  /** @inheritdoc */
  public hostDisconnected(): void {
    window.document.removeEventListener('scroll', this.__boundOnScroll);
  }
}
