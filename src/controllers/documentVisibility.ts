import type {ReactiveController, ReactiveControllerHost} from 'lit';

/**
 * Tracks the document's current visibility
 */
export class DocumentVisibilityController implements ReactiveController {
  public visible: boolean = false;

  private __host: ReactiveControllerHost;
  private __boundOnVisibilityChanged: () => void;

  /**
   * @param {ReactiveControllerHost} host Host to attach to
   */
  public constructor(host: ReactiveControllerHost) {
    this.__host = host;
    this.__boundOnVisibilityChanged = this.__onVisibilityChanged.bind(this);

    this.visible = window.document.visibilityState === 'visible';

    host.addController(this as ReactiveController);
  }

  /**
   * Fired when the focus has changed in the window
   * @return {void}
   */
  private __onVisibilityChanged(): void {
    this.visible = window.document.visibilityState === 'visible';
    this.__host.requestUpdate();
  }

  /** @inheritdoc */
  public hostConnected(): void {
    window.addEventListener(
      'visibilitychange',
      this.__boundOnVisibilityChanged
    );
  }

  /** @inheritdoc */
  public hostDisconnected(): void {
    window.removeEventListener(
      'visibilitychange',
      this.__boundOnVisibilityChanged
    );
  }
}
