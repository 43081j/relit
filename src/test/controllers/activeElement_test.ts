import {LitElement, html, TemplateResult} from 'lit';
import * as assert from 'uvu/assert';
import {ActiveElementController} from '../../controllers/activeElement.js';

/**
 * Test element with controller
 */
class TestElement extends LitElement {
  public controller: ActiveElementController;

  /** @inheritdoc */
  public constructor() {
    super();

    this.controller = new ActiveElementController(this);
  }

  /** @inheritdoc */
  protected override render(): TemplateResult {
    return html`${this.controller.activeElement?.nodeName}`;
  }
}

customElements.define('test-active-element', TestElement);

suite('ActiveElementController', () => {
  let element: TestElement;

  setup(async () => {
    element = document.createElement('test-active-element') as TestElement;
    document.body.appendChild(element);
  });

  teardown(() => {
    element.remove();
  });

  test('initialises to current active element', () => {
    assert.equal(
      element.controller.activeElement,
      document.activeElement
    );
  });

  test('updates active element on focus change', async () => {
    const input = document.createElement('input');

    try {
      document.body.appendChild(input);

      input.focus();
      input.dispatchEvent(
        new FocusEvent('focusin', {
          bubbles: true,
          composed: true
        })
      );

      await element.updateComplete;

      assert.equal(element.controller.activeElement, input);
      assert.equal(element.shadowRoot!.textContent, 'INPUT');

      input.blur();
      input.dispatchEvent(
        new FocusEvent('focusout', {
          bubbles: true,
          composed: true
        })
      );

      await element.updateComplete;

      assert.equal(element.controller.activeElement, document.body);
      assert.equal(element.shadowRoot!.textContent, 'BODY');
    } finally {
      input.remove();
    }
  });
});
