import '../util.js';

import {html, ReactiveController} from 'lit';
import * as assert from 'uvu/assert';
import {ItemSelectionController} from '../../controllers/itemSelection.js';
import type {TestElement} from '../util.js';

suite('ItemSelectionController', () => {
  let element: TestElement;
  let controller: ItemSelectionController<string>;
  let items: string[];

  setup(async () => {
    items = ['a', 'b', 'c'];
    element = document.createElement('test-element') as TestElement;
    element.template = () => html`Selected: ${controller.selectedItems}`;
  });

  teardown(() => {
    element.remove();
  });

  suite('single select', () => {
    setup(async () => {
      controller = new ItemSelectionController<string>(element, items);
      element.controllers.push(controller as ReactiveController);
      document.body.appendChild(element);
    });

    test('initialises to no selection', () => {
      assert.is(controller.selectedItems.length, 0);
      assert.is(controller.items, items);
    });

    suite('next()', () => {
      test('selects the next item', async () => {
        controller.select('a');
        controller.next();
        await element.updateComplete;
        assert.equal(controller.selectedItems, ['b']);
        assert.equal(element.shadowRoot!.textContent, 'Selected: b');
      });
    });

    suite('prev()', () => {
      test('selects the previous item', async () => {
        controller.select('c');
        controller.prev();
        await element.updateComplete;
        assert.equal(controller.selectedItems, ['b']);
        assert.equal(element.shadowRoot!.textContent, 'Selected: b');
      });
    });

    suite('selectByOffset()', () => {
      test('selects first item if out-of-bounds negative offset', async () => {
        controller.select('a');
        controller.selectByOffset(-1);
        await element.updateComplete;
        assert.equal(controller.selectedItems, ['a']);
        assert.equal(element.shadowRoot!.textContent, 'Selected: a');
      });

      test('selects last item if out-of-bounds positive offset', async () => {
        controller.select('c');
        controller.selectByOffset(1);
        await element.updateComplete;
        assert.equal(controller.selectedItems, ['c']);
        assert.equal(element.shadowRoot!.textContent, 'Selected: c');
      });

      test('selects first item if no selection', async () => {
        controller.selectByOffset(1);
        await element.updateComplete;
        assert.equal(controller.selectedItems, ['a']);
        assert.equal(element.shadowRoot!.textContent, 'Selected: a');
      });
    });

    suite('selectByIndex()', () => {
      test('selects the item at the given index', async () => {
        controller.selectByIndex(1);
        await element.updateComplete;
        assert.equal(controller.selectedItems, ['b']);
        assert.equal(element.shadowRoot!.textContent, 'Selected: b');
      });
    });

    suite('select()', () => {
      test('selects the given item', async () => {
        controller.select('b');
        await element.updateComplete;
        assert.equal(controller.selectedItems, ['b']);
        assert.equal(element.shadowRoot!.textContent, 'Selected: b');
      });
    });

    suite('deselectAll()', () => {
      test('deselects all items', async () => {
        controller.select('b');
        controller.deselectAll();
        await element.updateComplete;
        assert.equal(controller.selectedItems, []);
        assert.equal(element.shadowRoot!.textContent, 'Selected: ');
      });
    });

    suite('deselectByIndex()', () => {
      test('deselects the item at the given index', async () => {
        controller.select('b');
        controller.deselectByIndex(1);
        await element.updateComplete;
        assert.equal(controller.selectedItems, []);
        assert.equal(element.shadowRoot!.textContent, 'Selected: ');
      });
    });

    suite('deselect()', () => {
      test('deselects the given item', async () => {
        controller.select('b');
        controller.deselect('b');
        await element.updateComplete;
        assert.equal(controller.selectedItems, []);
        assert.equal(element.shadowRoot!.textContent, 'Selected: ');
      });
    });

    suite('toggleByIndex()', () => {
      test('throws if index out of range (lower bound)', () => {
        try {
          controller.toggleByIndex(-1);
          assert.unreachable();
        } catch (err) {
          assert.equal((err as Error).message, 'Index cannot be below 0');
        }
      });

      test('throws if index out of range (upper bound)', () => {
        try {
          controller.toggleByIndex(10);
          assert.unreachable();
        } catch (err) {
          assert.equal(
            (err as Error).message,
            'Index cannot be greater than size of items array'
          );
        }
      });

      test('selects a currently deselected item', async () => {
        controller.toggleByIndex(1);
        await element.updateComplete;
        assert.equal(controller.selectedItems, ['b']);
        assert.equal(element.shadowRoot!.textContent, 'Selected: b');
      });

      test('deselects a currently selected item', async () => {
        controller.select('b');
        controller.toggleByIndex(1);
        await element.updateComplete;
        assert.equal(controller.selectedItems, []);
        assert.equal(element.shadowRoot!.textContent, 'Selected: ');
      });

      test('can force select', async () => {
        controller.toggleByIndex(1, true);
        await element.updateComplete;
        assert.equal(controller.selectedItems, ['b']);
        assert.equal(element.shadowRoot!.textContent, 'Selected: b');
      });

      test('forcing select of already selected item', async () => {
        controller.select('b');
        controller.toggleByIndex(1, true);
        await element.updateComplete;
        assert.equal(controller.selectedItems, ['b']);
        assert.equal(element.shadowRoot!.textContent, 'Selected: b');
      });

      test('can force deselect', async () => {
        controller.select('b');
        controller.toggleByIndex(1, false);
        await element.updateComplete;
        assert.equal(controller.selectedItems, []);
        assert.equal(element.shadowRoot!.textContent, 'Selected: ');
      });

      test('forcing deselect of already deselected item', async () => {
        controller.toggleByIndex(1, false);
        await element.updateComplete;
        assert.equal(controller.selectedItems, []);
        assert.equal(element.shadowRoot!.textContent, 'Selected: ');
      });
    });

    suite('toggle()', () => {
      test('throws if item does not exist', () => {
        try {
          controller.toggle('non-existent');
          assert.unreachable();
        } catch (err) {
          assert.equal((err as Error).message, 'Item was not in items array');
        }
      });

      test('toggles specified item', async () => {
        controller.toggle('b');
        await element.updateComplete;
        assert.equal(controller.selectedItems, ['b']);
        assert.equal(element.shadowRoot!.textContent, 'Selected: b');

        controller.toggle('b');
        await element.updateComplete;
        assert.equal(controller.selectedItems, []);
        assert.equal(element.shadowRoot!.textContent, 'Selected: ');
      });

      test('can force select', async () => {
        controller.toggle('b', true);
        await element.updateComplete;
        assert.equal(controller.selectedItems, ['b']);
        assert.equal(element.shadowRoot!.textContent, 'Selected: b');
      });

      test('can force deselect', async () => {
        controller.select('b');
        controller.toggle('b', false);
        await element.updateComplete;
        assert.equal(controller.selectedItems, []);
        assert.equal(element.shadowRoot!.textContent, 'Selected: ');
      });
    });
  });

  suite('multi select', () => {
    setup(async () => {
      controller = new ItemSelectionController<string>(element, items, {
        multiSelect: true
      });
      element.controllers.push(controller as ReactiveController);
      document.body.appendChild(element);
    });

    suite('select()', () => {
      test('can select multiple items', async () => {
        controller.select('a');
        controller.select('b');
        assert.equal(controller.selectedItems, ['a', 'b']);
        await element.updateComplete;
        assert.equal(element.shadowRoot!.textContent, 'Selected: ab');
      });
    });

    suite('next()', () => {
      test('throws an error', () => {
        try {
          controller.next();
          assert.unreachable();
        } catch (err) {
          assert.is(
            (err as Error).message,
            'next() cannot be used when in multi-select mode'
          );
        }
      });
    });

    suite('prev()', () => {
      test('throws an error', () => {
        try {
          controller.prev();
          assert.unreachable();
        } catch (err) {
          assert.is(
            (err as Error).message,
            'prev() cannot be used when in multi-select mode'
          );
        }
      });
    });

    suite('selectByOffset()', () => {
      test('throws an error', () => {
        try {
          controller.selectByOffset(1);
          assert.unreachable();
        } catch (err) {
          assert.is(
            (err as Error).message,
            'selectByOffset() cannot be used when in multi-select mode'
          );
        }
      });
    });

    suite('deselectAll', () => {
      test('deselects all items', async () => {
        controller.select('b');
        controller.select('c');
        controller.deselectAll();
        await element.updateComplete;
        assert.equal(controller.selectedItems, []);
        assert.equal(element.shadowRoot!.textContent, 'Selected: ');
      });
    });

    suite('toggleByIndex()', () => {
      test('selects a currently deselected item', async () => {
        controller.toggleByIndex(1);
        controller.toggleByIndex(2);
        await element.updateComplete;
        assert.equal(controller.selectedItems, ['b', 'c']);
        assert.equal(element.shadowRoot!.textContent, 'Selected: bc');
      });

      test('deselects a currently selected item', async () => {
        controller.select('b');
        controller.select('c');
        controller.toggleByIndex(1);
        await element.updateComplete;
        assert.equal(controller.selectedItems, ['c']);
        assert.equal(element.shadowRoot!.textContent, 'Selected: c');
      });
    });
  });

  suite('multi select with defaultSelectedIndices', () => {
    setup(async () => {
      controller = new ItemSelectionController<string>(element, items, {
        defaultSelectedIndices: [1, 2],
        multiSelect: true
      });
      element.controllers.push(controller as ReactiveController);
      document.body.appendChild(element);
    });

    test('initialises to default selection', () => {
      assert.equal(controller.selectedItems, ['b', 'c']);
      assert.equal(element.shadowRoot!.textContent, 'Selected: bc');
    });
  });

  suite('single select with defaultSelectedIndices', () => {
    setup(async () => {
      controller = new ItemSelectionController<string>(element, items, {
        defaultSelectedIndices: [1]
      });
      element.controllers.push(controller as ReactiveController);
      document.body.appendChild(element);
    });

    test('initialises to default selection', () => {
      assert.equal(controller.selectedItems, ['b']);
      assert.equal(element.shadowRoot!.textContent, 'Selected: b');
    });
  });
});
