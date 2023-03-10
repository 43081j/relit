import '../util.js';

import {html} from 'lit';
import * as assert from 'uvu/assert';
import {DocumentVisibilityController} from '../../main.js';
import type {TestElement} from '../util.js';

suite('DocumentVisibilityController', () => {
  let element: TestElement;
  let controller: DocumentVisibilityController;

  setup(async () => {
    element = document.createElement('test-element');
    controller = new DocumentVisibilityController(element);
    element.controllers.push(controller);
    element.template = () => html`${controller.visible}`;
    document.body.appendChild(element);
  });

  teardown(() => {
    element.remove();
  });

  test('initialises to current visibility', () => {
    assert.equal(controller.visible, true);
    assert.equal(element.shadowRoot!.textContent, 'true');
  });

  test('updates visibility on visibility change');
});
