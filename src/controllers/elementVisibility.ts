import type {ReactiveController, ReactiveControllerHost} from 'lit';

/**
 * Tracks the visibility of an element
 */
export class ElementVisibilityController implements ReactiveController {
  public visible: boolean = true;

  private __host: ReactiveControllerHost & Element;
  private __boundOnScroll: () => void;

  /**
   * @param {ReactiveControllerHost} host Host to attach to
   */
  public constructor(host: ReactiveControllerHost & Element) {
    this.__host = host;
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

    this.__host.requestUpdate();
  }

  /**
   * Computes the visibility of the element
   * @return {boolean}
   */
  private __computeVisibility(): boolean {
    const rect = this.__host.getBoundingClientRect();

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
