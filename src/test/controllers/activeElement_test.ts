import '../util.js';

import {html} from 'lit';
import * as assert from 'uvu/assert';
import {ActiveElementController} from '../../main.js';
import type {TestElement} from '../util.js';

suite('ActiveElementController', () => {
  let element: TestElement;
  let controller: ActiveElementController;

  setup(async () => {
    element = document.createElement('test-element') as TestElement;
    controller = new ActiveElementController(element);
    element.controllers.push(controller);
    element.template = () => html`${controller.activeElement?.nodeName}`;
    document.body.appendChild(element);
  });

  teardown(() => {
    element.remove();
  });

  test('initialises to current active element', () => {
    assert.equal(controller.activeElement, document.activeElement);
    assert.equal(element.shadowRoot!.textContent, 'BODY');
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

      assert.equal(controller.activeElement, input);
      assert.equal(element.shadowRoot!.textContent, 'INPUT');

      input.blur();
      input.dispatchEvent(
        new FocusEvent('focusout', {
          bubbles: true,
          composed: true
        })
      );

      await element.updateComplete;

      assert.equal(controller.activeElement, document.body);
      assert.equal(element.shadowRoot!.textContent, 'BODY');
    } finally {
      input.remove();
    }
  });
});
