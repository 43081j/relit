import {LitElement, html, css} from 'lit';
import type {ReactiveController, TemplateResult} from 'lit';

type TestTemplateFn = () => TemplateResult;

/**
 * Test element with controller
 */
export class TestElement extends LitElement {
  public static override styles = css`
    :host {
      display: block;
    }
  `;
  public controllers: ReactiveController[] = [];
  public template?: TestTemplateFn;

  /** @inheritdoc */
  protected override render(): TemplateResult {
    return this.template?.() ?? html``;
  }
}

customElements.define('test-element', TestElement);

declare global {
  interface HTMLElementTagNameMap {
    'test-element': TestElement;
  }
}
