import '../util.js';

import {html} from 'lit';
import * as assert from 'uvu/assert';
import {LocalStorageController} from '../../main.js';
import type {TestElement} from '../util.js';

suite('LocalStorageController', () => {
  let element: TestElement;
  let controller: LocalStorageController<[number, number]>;

  teardown(() => {
    element.remove();
    window.localStorage.removeItem('test-key');
  });

  suite('default', () => {
    setup(async () => {
      element = document.createElement('test-element') as TestElement;
      controller = new LocalStorageController(element, 'test-key');
      element.controllers.push(controller);
      element.template = () => html`${JSON.stringify(controller.value)}`;
      document.body.appendChild(element);
    });

    test('initialises to undefined', () => {
      assert.equal(controller.value, undefined);
      assert.equal(element.shadowRoot!.textContent, '');
    });

    suite('set value', () => {
      test('sets value in local storage', async () => {
        controller.value = [0, 0];
        await element.updateComplete;

        const storageValue = window.localStorage.getItem('test-key');

        assert.equal(controller.value, [0, 0]);
        assert.equal(element.shadowRoot!.textContent, '[0,0]');
        assert.is(storageValue, '[0,0]');
      });

      test('removes from storage if value undefined', async () => {
        controller.value = [0, 0];
        await element.updateComplete;

        controller.value = undefined;
        await element.updateComplete;

        const storageValue = window.localStorage.getItem('test-key');

        assert.equal(controller.value, undefined);
        assert.equal(element.shadowRoot!.textContent, '');
        assert.is(storageValue, null);
      });

      test('updates other instances', async () => {
        const otherController = new LocalStorageController(element, 'test-key');
        element.controllers.push(otherController);

        otherController.value = [1, 2];
        await element.updateComplete;

        const storageValue = window.localStorage.getItem('test-key');

        assert.equal(otherController.value, [1, 2]);
        assert.equal(element.shadowRoot!.textContent, '[1,2]');
        assert.is(storageValue, '[1,2]');
      });
    });

    test('reacts to storage events', async () => {
      window.localStorage.setItem('test-key', '[3,4]');
      window.dispatchEvent(
        new StorageEvent('storage', {
          storageArea: window.localStorage,
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
      controller = new LocalStorageController(element, 'test-key', [5, 6]);
      element.controllers.push(controller);
      element.template = () => html`${JSON.stringify(controller.value)}`;
      document.body.appendChild(element);
      await element.updateComplete;
    });

    test('initialises to default value', () => {
      const storageValue = window.localStorage.getItem('test-key');

      assert.equal(controller.value, [5, 6]);
      assert.equal(element.shadowRoot!.textContent, '[5,6]');
      assert.is(storageValue, '[5,6]');
    });
  });

  suite('with saved value', () => {
    setup(() => {
      window.localStorage.setItem('test-key', JSON.stringify([7, 8]));
      element = document.createElement('test-element') as TestElement;
      element.template = () => html`${JSON.stringify(controller.value)}`;
      document.body.appendChild(element);
    });

    test('initialises to saved value', async () => {
      controller = new LocalStorageController(element, 'test-key');
      element.controllers.push(controller);
      await element.updateComplete;

      const storageValue = window.localStorage.getItem('test-key');
      assert.equal(controller.value, [7, 8]);
      assert.equal(element.shadowRoot!.textContent, '[7,8]');
      assert.is(storageValue, '[7,8]');
    });

    test('ignore default value and use saved value', async () => {
      controller = new LocalStorageController(element, 'test-key', [9, 10]);
      element.controllers.push(controller);
      await element.updateComplete;

      const storageValue = window.localStorage.getItem('test-key');
      assert.equal(controller.value, [7, 8]);
      assert.equal(element.shadowRoot!.textContent, '[7,8]');
      assert.is(storageValue, '[7,8]');
    });
  });
});
