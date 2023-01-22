import type {ReactiveController, ReactiveControllerHost} from 'lit';

/**
 * Tracks the scroll offset of the window
 */
export class WindowScrollController implements ReactiveController {
  public x: number = 0;
  public y: number = 0;

  private __host: ReactiveControllerHost;

  /**
   * @param {ReactiveControllerHost} host Host to attach to
   */
  public constructor(host: ReactiveControllerHost) {
    this.__host = host;

    this.x = window.pageXOffset;
    this.y = window.pageYOffset;

    host.addController(this);
  }

  /**
   * Fired when the window has been scrolled
   * @return {void}
   */
  private __onScroll: () => void = (): void => {
    this.x = window.pageXOffset;
    this.y = window.pageYOffset;
    this.__host.requestUpdate();
  };

  /** @inheritdoc */
  public hostConnected(): void {
    window.addEventListener('scroll', this.__onScroll, {passive: true});
  }

  /** @inheritdoc */
  public hostDisconnected(): void {
    window.removeEventListener('scroll', this.__onScroll);
  }
}
