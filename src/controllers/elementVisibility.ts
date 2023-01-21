import type {ReactiveController, ReactiveControllerHost} from 'lit';
import type {Ref} from 'lit/directives/ref.js';
import {ElementTrackingController} from '../_internal/elementTracking.js';

/**
 * Tracks the visibility of an element
 */
export class ElementVisibilityController extends ElementTrackingController {
  public visible: boolean = true;

  private __observer: IntersectionObserver;

  /**
   * @param {ReactiveControllerHost} host Host to attach to
   * @param {Ref=} ref Ref to observe instead of the host element
   */
  public constructor(host: ReactiveControllerHost & Element, ref?: Ref) {
    super(host, ref);

    this.__observer = new IntersectionObserver(
      (entries) => this.__onIntersectionChange(entries),
      {threshold: 1}
    );

    const el = this._element;

    if (el) {
      const rect = el.getBoundingClientRect();
      this.visible = this.__computeVisibilityFromRect(rect);
    }

    host.addController(this as ReactiveController);
  }

  /**
   * Fires when the intersection observer is triggered
   * @param {IntersectionObserverEntry[]} entries Intersection changes
   * @return {void}
   */
  private __onIntersectionChange(entries: IntersectionObserverEntry[]): void {
    const el = this._element;

    if (!el) {
      return;
    }

    const entry = entries.find((e) => e.target === el);

    if (!entry) {
      return;
    }

    this.visible = entry.isIntersecting;
    this._host.requestUpdate();
  }

  /** @inheritdoc */
  protected override _onElementChanged(): void {
    this.__observer.disconnect();

    const el = this._element;

    if (el) {
      this.__observer.observe(el);
    }
  }

  /**
   * Computes the visibility from a DOM rect
   * @param {DOMRect} rect Rect to calculate visibility from
   * @return {boolean}
   */
  private __computeVisibilityFromRect(rect: DOMRect): boolean {
    return (
      rect.top <= window.innerHeight &&
      rect.left <= window.innerWidth &&
      rect.bottom >= 0 &&
      rect.right >= 0
    );
  }
}
