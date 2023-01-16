import type {ReactiveController, ReactiveControllerHost} from 'lit';

/**
 * Tracks the active element of a document or document fragment
 */
export class ActiveElementController implements ReactiveController {
  public activeElement: DocumentOrShadowRoot['activeElement'];

  private __host: ReactiveControllerHost;
  private __boundOnFocus: (ev: FocusEvent) => void;
  private __document: DocumentOrShadowRoot;

  /**
   * @param {ReactiveControllerHost} host Host to attach to
   * @param {DocumentOrShadowRoot} doc Custom document to observe
   */
  public constructor(
    host: ReactiveControllerHost,
    doc: DocumentOrShadowRoot = window.document
  ) {
    this.__host = host;
    this.__document = doc;
    this.__boundOnFocus = this.__onFocus.bind(this);

    this.activeElement = doc.activeElement;

    host.addController(this);
  }

  /**
   * Fired when the focus has changed in the window
   * @return {void}
   */
  private __onFocus(): void {
    this.activeElement = this.__document.activeElement;
    this.__host.requestUpdate();
  }

  /** @inheritdoc */
  public hostConnected(): void {
    window.addEventListener('focusin', this.__boundOnFocus);
    window.addEventListener('focusout', this.__boundOnFocus);
  }

  /** @inheritdoc */
  public hostDisconnected(): void {
    window.removeEventListener('focusin', this.__boundOnFocus);
    window.removeEventListener('focusout', this.__boundOnFocus);
  }
}
