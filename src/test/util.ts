import {LitElement, html, css} from 'lit';
import type {
  ReactiveController,
  TemplateResult,
  PropertyDeclarations
} from 'lit';

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

  /** @inheritdoc */
  public static override get properties(): PropertyDeclarations {
    return {
      template: {type: Object}
    };
  }

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

export async function delay(timeoutMs: number): Promise<void> {
  await new Promise((r) => setTimeout(r, timeoutMs));
}

declare global {
  interface HTMLElementTagNameMap {
    'test-element': TestElement;
  }
}
