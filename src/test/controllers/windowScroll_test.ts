import '../util.js';

import {html} from 'lit';
import * as assert from 'uvu/assert';
import {WindowScrollController} from '../../main.js';
import type {TestElement} from '../util.js';

suite('WindowScrollController', () => {
  let element: TestElement;
  let controller: WindowScrollController;
  let tallDiv: HTMLElement;

  setup(async () => {
    tallDiv = document.createElement('div');
    tallDiv.style.height = '110vh';
    tallDiv.style.width = '10rem';
    element = document.createElement('test-element') as TestElement;
    controller = new WindowScrollController(element);
    element.controllers.push(controller);
    element.template = () => html`x: ${controller.x}, y: ${controller.y}`;
    document.body.appendChild(element);
    document.body.appendChild(tallDiv);
    await element.updateComplete;
  });

  teardown(() => {
    element.remove();
    tallDiv.remove();
  });

  test('initialises to current offset', () => {
    assert.equal(controller.x, 0);
    assert.equal(controller.y, 0);
    assert.equal(element.shadowRoot!.textContent, 'x: 0, y: 0');
  });

  test('observes changes in scroll offset', async () => {
    window.scrollBy(0, 10);

    await new Promise((res) => {
      window.requestAnimationFrame(res);
    });
    await element.updateComplete;

    assert.equal(controller.x, 0);
    assert.equal(controller.y, 10);
    assert.equal(element.shadowRoot!.textContent, 'x: 0, y: 10');
  });
});
