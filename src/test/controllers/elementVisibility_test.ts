import '../util.js';

import {html} from 'lit';
import * as assert from 'uvu/assert';
import {ElementVisibilityController} from '../../main.js';
import type {TestElement} from '../util.js';

suite('ElementVisibilityController', () => {
  let element: TestElement;
  let controller: ElementVisibilityController;

  setup(async () => {
    element = document.createElement('test-element') as TestElement;
    controller = new ElementVisibilityController(element);
    element.controllers.push(controller);
    element.template = () => html`Visible: ${controller.visible}`;
    document.body.appendChild(element);
    await element.updateComplete;
  });

  teardown(() => {
    element.remove();
  });

  test('initialises to the current visibility', () => {
    assert.equal(controller.visible, true);
    assert.equal(element.shadowRoot!.textContent, 'Visible: true');
  });

  test('observes visibility changes', async () => {
    const bigElement = document.createElement('div');
    bigElement.style.height = '6000px';
    bigElement.style.width = '10px';

    try {
      document.body.appendChild(bigElement);

      window.scrollBy(0, 100);

      // TODO (43081j): find a better way to wait for the
      // observer to trigger
      await new Promise((res) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(res);
        });
      });

      assert.equal(controller.visible, false);
      assert.equal(element.shadowRoot!.textContent, 'Visible: false');
    } finally {
      bigElement.remove();
    }
  });
});
