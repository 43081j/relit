import '../util.js';

import {html, PropertyDeclarations} from 'lit';
import * as assert from 'uvu/assert';
import {PropertyHistoryController} from '../../main.js';
import {TestElementBase} from '../util.js';

/**
 * Test element for the property history controller
 */
class PropertyHistoryTestElement extends TestElementBase {
  public prop?: string;

  /** @inheritdoc */
  public static override get properties(): PropertyDeclarations {
    return {
      prop: {type: String}
    };
  }
}

customElements.define('property-history-test', PropertyHistoryTestElement);

suite('PropertyHistoryController', () => {
  let element: PropertyHistoryTestElement;
  let controller: PropertyHistoryController<PropertyHistoryTestElement, 'prop'>;

  setup(async () => {
    element = document.createElement(
      'property-history-test'
    ) as PropertyHistoryTestElement;
    controller = new PropertyHistoryController(element, 'prop');
    element.controllers.push(controller);
    element.template = () => html`Last: ${controller.lastChanged}`;
    document.body.appendChild(element);
    await element.updateComplete;
  });

  teardown(() => {
    element.remove();
  });

  test('initialises with current value', () => {
    assert.is.not(controller.lastChanged, undefined);
    assert.is.not(element.shadowRoot!.textContent, 'Last: ');
  });

  test('observes changes to property', async () => {
    const prevValue = controller.lastChanged;

    element.prop = 'foo';
    await element.updateComplete;

    assert.is.not(controller.lastChanged, prevValue);
    assert.not.equal(element.shadowRoot!.textContent, 'Last: ');
  });

  test('no value change if property value same', async () => {
    element.prop = 'foo';
    await element.updateComplete;

    const prevValue = controller.lastChanged;

    element.prop = 'foo';
    await element.updateComplete;

    assert.is(controller.lastChanged, prevValue);
  });

  suite('undo', () => {
    test('can undo to previous value', async () => {
      element.prop = 'foo';
      await element.updateComplete;

      const prevValue = controller.lastChanged;

      controller.undo();
      await element.updateComplete;

      assert.equal(element.prop, undefined);
      assert.is.not(prevValue, controller.lastChanged);
    });

    test('can undo multiple times', async () => {
      element.prop = 'foo';
      await element.updateComplete;
      element.prop = 'bar';
      await element.updateComplete;
      element.prop = 'baz';
      await element.updateComplete;

      controller.undo();
      await element.updateComplete;
      controller.undo();
      await element.updateComplete;

      assert.equal(element.prop, 'foo');
    });

    test('cannot undo beyond start value', async () => {
      controller.undo();
      await element.updateComplete;

      assert.equal(element.prop, undefined);
    });
  });

  suite('redo', () => {
    test('can redo to an undone value', async () => {
      element.prop = 'foo';
      await element.updateComplete;

      controller.undo();
      await element.updateComplete;

      const prevValue = controller.lastChanged;

      controller.redo();
      await element.updateComplete;

      assert.equal(element.prop, 'foo');
      assert.is.not(prevValue, controller.lastChanged);
    });

    test('can redo multiple times', async () => {
      element.prop = 'foo';
      await element.updateComplete;
      element.prop = 'bar';
      await element.updateComplete;
      element.prop = 'baz';
      await element.updateComplete;

      controller.undo(); // bar
      controller.undo(); // foo
      controller.redo(); // bar
      controller.redo(); // baz

      await element.updateComplete;

      assert.equal(element.prop, 'baz');
    });

    test('cannot redo beyond latest value', async () => {
      controller.redo();
      await element.updateComplete;

      assert.equal(element.prop, undefined);
    });
  });
});
