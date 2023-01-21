import {LitElement, html, css} from 'lit';
import type {ReactiveController, TemplateResult} from 'lit';

type TestTemplateFn = () => TemplateResult;

/**
 * Base of all test elements
 */
export abstract class TestElementBase extends LitElement {
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

/**
 * Test element with controllers
 */
export class TestElement extends TestElementBase {}

customElements.define('test-element', TestElement);

declare global {
  interface HTMLElementTagNameMap {
    'test-element': TestElement;
  }
}
