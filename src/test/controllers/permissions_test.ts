import '../util.js';

import {html, ReactiveController} from 'lit';
import * as assert from 'uvu/assert';
import {PermissionsController} from '../../main.js';
import type {TestElement} from '../util.js';

suite('PermissionsController', () => {
  let element: TestElement;
  let controller: PermissionsController;

  setup(async () => {
    element = document.createElement('test-element') as TestElement;
    controller = new PermissionsController(element, 'geolocation');
    element.controllers.push(controller as ReactiveController);
    element.template = () => html`${controller.state}`;
    document.body.appendChild(element);
    await element.updateComplete;
  });

  teardown(() => {
    element.remove();
  });

  test('initialises to pending', () => {
    assert.equal(controller.state, 'pending');
    assert.equal(element.shadowRoot!.textContent, 'pending');
  });

  test('observes changes to permission');
});
