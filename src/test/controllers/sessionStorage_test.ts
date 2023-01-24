import '../util.js';

import {html} from 'lit';
import * as assert from 'uvu/assert';
import {SessionStorageController} from '../../main.js';
import type {TestElement} from '../util.js';

suite('SessionStorageController', () => {
  let element: TestElement;
  let controller: SessionStorageController<[number, number]>;

  teardown(() => {
    element.remove();
    window.sessionStorage.removeItem('test-key');
  });

  suite('default', () => {
    setup(async () => {
      element = document.createElement('test-element') as TestElement;
      controller = new SessionStorageController(element, 'test-key');
      element.controllers.push(controller);
      element.template = () => html`${JSON.stringify(controller.value)}`;
      document.body.appendChild(element);
    });

    test('initialises to undefined', () => {
      assert.equal(controller.value, undefined);
      assert.equal(element.shadowRoot!.textContent, '');
    });

    suite('set value', () => {
      test('sets value in session storage', async () => {
        controller.value = [0, 0];
        await element.updateComplete;

        const storageValue = window.sessionStorage.getItem('test-key');

        assert.equal(controller.value, [0, 0]);
        assert.equal(element.shadowRoot!.textContent, '[0,0]');
        assert.is(storageValue, '[0,0]');
      });

      test('removes from storage if value undefined', async () => {
        controller.value = [0, 0];
        await element.updateComplete;

        controller.value = undefined;
        await element.updateComplete;

        const storageValue = window.sessionStorage.getItem('test-key');

        assert.equal(controller.value, undefined);
        assert.equal(element.shadowRoot!.textContent, '');
        assert.is(storageValue, null);
      });

      test('updates other instances', async () => {
        const otherController = new SessionStorageController(
          element,
          'test-key'
        );
        element.controllers.push(otherController);

        otherController.value = [1, 2];
        await element.updateComplete;

        const storageValue = window.sessionStorage.getItem('test-key');

        assert.equal(otherController.value, [1, 2]);
        assert.equal(element.shadowRoot!.textContent, '[1,2]');
        assert.is(storageValue, '[1,2]');
      });
    });

    test('reacts to storage events', async () => {
      window.sessionStorage.setItem('test-key', '[3,4]');
      window.dispatchEvent(
        new StorageEvent('storage', {
          storageArea: window.sessionStorage,
          key: 'test-key'
        })
      );

      await element.updateComplete;

      assert.equal(controller.value, [3, 4]);
      assert.equal(element.shadowRoot!.textContent, '[3,4]');
    });
  });

  suite('with default value', () => {
    setup(async () => {
      element = document.createElement('test-element') as TestElement;
      controller = new SessionStorageController(element, 'test-key', [5, 6]);
      element.controllers.push(controller);
      element.template = () => html`${JSON.stringify(controller.value)}`;
      document.body.appendChild(element);
      await element.updateComplete;
    });

    test('initialises to default value', () => {
      const storageValue = window.sessionStorage.getItem('test-key');

      assert.equal(controller.value, [5, 6]);
      assert.equal(element.shadowRoot!.textContent, '[5,6]');
      assert.is(storageValue, '[5,6]');
    });
  });
});
