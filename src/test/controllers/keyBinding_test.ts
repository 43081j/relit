import '../util.js';

import * as hanbi from 'hanbi';
import {html} from 'lit';
import * as assert from 'uvu/assert';
import {createRef, ref} from 'lit/directives/ref.js';
import type {Ref} from 'lit/directives/ref.js';
import {KeyBindingController} from '../../main.js';
import type {KeyBindingHandler} from '../../main.js';
import type {TestElement} from '../util.js';

/**
 * Simulates a key press via keydown/keyup
 * @param {Element} node Node to emit press to
 * @param {string} key Key to press
 * @param {number=} numOfKeyDown Number of keydown events
 * @return {void}
 */
function simulateKeyPress(
  node: Element,
  key: string | string[],
  numOfKeyDown: number = 1
): void {
  const keys = Array.isArray(key) ? key : [key];

  for (const k of keys) {
    for (let i = 0; i < numOfKeyDown; i++) {
      node.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: k,
          bubbles: true,
          composed: true
        })
      );
    }
  }

  for (const k of keys) {
    node.dispatchEvent(
      new KeyboardEvent('keyup', {
        key: k,
        bubbles: true,
        composed: true
      })
    );
  }
}

suite('KeyBindingController', () => {
  let element: TestElement;
  let controller: KeyBindingController;

  setup(() => {
    element = document.createElement('test-element');
    element.setAttribute('tabindex', '-1');
  });

  teardown(() => {
    element.remove();
    hanbi.restore();
  });

  suite('host element', () => {
    setup(async () => {
      controller = new KeyBindingController(element);
      element.controllers.push(controller);
      document.body.appendChild(element);
      await element.updateComplete;
    });

    suite('bindKey', () => {
      test('calls function on key up', () => {
        const spy = hanbi.spy<KeyBindingHandler>();

        controller.bindKey('x', spy.handler);

        simulateKeyPress(element, 'x');
        simulateKeyPress(element, 'y');

        const ev = spy.firstCall!.args[0];

        assert.is(ev.type, 'keyup');
        assert.is(spy.callCount, 1);
      });

      test('calls function on key down via triggers', () => {
        const spy = hanbi.spy<KeyBindingHandler>();

        controller.bindKey('x', spy.handler, {triggers: ['keydown']});

        simulateKeyPress(element, 'x');

        const ev = spy.firstCall!.args[0];

        assert.is(ev.type, 'keydown');
        assert.is(spy.callCount, 1);
      });

      test('calls function on key up/down via triggers', () => {
        const spy = hanbi.spy<KeyBindingHandler>();

        controller.bindKey('x', spy.handler, {triggers: ['keydown', 'keyup']});

        simulateKeyPress(element, 'x');

        const firstEv = spy.getCall(0)!.args[0];
        const secondEv = spy.getCall(1)!.args[0];

        assert.is(spy.callCount, 2);
        assert.is(firstEv.type, 'keydown');
        assert.is(secondEv.type, 'keyup');
      });

      test('calls function on first key down via triggers', () => {
        const spy = hanbi.spy<KeyBindingHandler>();

        controller.bindKey('x', spy.handler, {triggers: ['firstKeyDown']});

        simulateKeyPress(element, 'x', 2);

        const ev = spy.getCall(0)!.args[0];

        assert.is(spy.callCount, 1);
        assert.is(ev.type, 'keydown');
      });

      test('calls function on key up/first key down via triggers', () => {
        const spy = hanbi.spy<KeyBindingHandler>();

        controller.bindKey('x', spy.handler, {
          triggers: ['keyup', 'firstKeyDown']
        });

        simulateKeyPress(element, 'x', 2);

        const firstEv = spy.getCall(0)!.args[0];
        const secondEv = spy.getCall(1)!.args[0];

        assert.is(spy.callCount, 2);
        assert.is(firstEv.type, 'keydown');
        assert.is(secondEv.type, 'keyup');
      });

      test('accepts single key', () => {
        const spy = hanbi.spy<KeyBindingHandler>();

        controller.bindKey('x', spy.handler);

        simulateKeyPress(element, 'x');

        const ev = spy.firstCall!.args[0];

        assert.is(ev.type, 'keyup');
        assert.is(spy.callCount, 1);
      });

      test('accepts multiple keys', () => {
        const spy = hanbi.spy<KeyBindingHandler>();

        controller.bindKey(['x', 'y'], spy.handler);

        simulateKeyPress(element, ['x', 'y']);

        const ev = spy.firstCall!.args[0];

        assert.is(spy.callCount, 1);
        assert.is(ev.type, 'keyup');
        assert.is(ev.key, 'x');
      });

      test('supports modifier keys (ctrl)', () => {
        const spy = hanbi.spy<KeyBindingHandler>();

        controller.bindKey(['ctrl', 'a'], spy.handler);

        simulateKeyPress(element, ['Ctrl', 'a']);

        const ev = spy.firstCall!.args[0];

        assert.is(spy.callCount, 1);
        assert.is(ev.type, 'keyup');
        assert.is(ev.key, 'Ctrl');
      });

      test('supports modifier keys (meta)', () => {
        const spy = hanbi.spy<KeyBindingHandler>();

        controller.bindKey(['meta', 'a'], spy.handler);

        simulateKeyPress(element, ['Meta', 'a']);

        const ev = spy.firstCall!.args[0];

        assert.is(spy.callCount, 1);
        assert.is(ev.type, 'keyup');
        assert.is(ev.key, 'Meta');
      });

      test('supports modifier keys (alt)', () => {
        const spy = hanbi.spy<KeyBindingHandler>();

        controller.bindKey(['alt', 'a'], spy.handler);

        simulateKeyPress(element, ['Alt', 'a']);

        const ev = spy.firstCall!.args[0];

        assert.is(spy.callCount, 1);
        assert.is(ev.type, 'keyup');
        assert.is(ev.key, 'Alt');
      });

      test('supports modifier keys (shift)', () => {
        const spy = hanbi.spy<KeyBindingHandler>();

        controller.bindKey(['shift', 'a'], spy.handler);

        simulateKeyPress(element, ['Shift', 'a']);

        const ev = spy.firstCall!.args[0];

        assert.is(spy.callCount, 1);
        assert.is(ev.type, 'keyup');
        assert.is(ev.key, 'Shift');
      });
    });

    suite('bindFocus', () => {
      test('focuses element on key up', async () => {
        const divRef = createRef();
        element.template = () => html`
          <div ${ref(divRef)} tabindex="-1"></div>
        `;
        await element.updateComplete;

        controller.bindFocus('x', divRef);

        assert.is(element.shadowRoot!.activeElement, null);

        simulateKeyPress(element, 'x');

        assert.is(element.shadowRoot!.activeElement, divRef.value!);
      });

      test('handles empty refs', async () => {
        const divRef = createRef();

        controller.bindFocus('x', divRef);

        assert.is(element.shadowRoot!.activeElement, null);

        simulateKeyPress(element, 'x');

        assert.is(element.shadowRoot!.activeElement, null);
      });
    });

    suite('bindPush', () => {
      test('calls function on key up/first key down', () => {
        const spy = hanbi.spy<KeyBindingHandler>();

        controller.bindPush('x', spy.handler);

        simulateKeyPress(element, 'x', 2);

        const firstEv = spy.getCall(0)!.args[0];
        const secondEv = spy.getCall(1)!.args[0];

        assert.is(spy.callCount, 2);
        assert.is(firstEv.type, 'keydown');
        assert.is(secondEv.type, 'keyup');
      });
    });

    test('ignores presses from textareas by default', async () => {
      const spy = hanbi.spy<KeyBindingHandler>();

      controller.bindKey('x', spy.handler);

      element.template = () => html`
        <textarea></textarea>
      `;
      await element.updateComplete;

      const node = element.shadowRoot!.querySelector('textarea')!;

      simulateKeyPress(node, 'x');

      assert.is(spy.called, false);
    });

    test('ignores presses from inputs by default', async () => {
      const spy = hanbi.spy<KeyBindingHandler>();

      controller.bindKey('x', spy.handler);

      element.template = () => html`
        <input>
      `;
      await element.updateComplete;

      const node = element.shadowRoot!.querySelector('input')!;

      simulateKeyPress(node, 'x');

      assert.is(spy.called, false);
    });

    test('ignores presses from selects by default', async () => {
      const spy = hanbi.spy<KeyBindingHandler>();

      controller.bindKey('x', spy.handler);

      element.template = () => html`
        <select></select>
      `;
      await element.updateComplete;

      const node = element.shadowRoot!.querySelector('select')!;

      simulateKeyPress(node, 'x');

      assert.is(spy.called, false);
    });
  });

  suite('options.ignoredElements', () => {
    setup(async () => {
      controller = new KeyBindingController(element, null, {
        ignoredElements: ['span', '.foo']
      });
      element.controllers.push(controller);
      document.body.appendChild(element);
      await element.updateComplete;
    });

    test('ignores presses from named tags', async () => {
      const spy = hanbi.spy<KeyBindingHandler>();

      controller.bindKey('x', spy.handler);

      element.template = () => html`
        <span></span>
      `;
      await element.updateComplete;

      const node = element.shadowRoot!.querySelector('span')!;

      simulateKeyPress(node, 'x');

      assert.is(spy.called, false);
    });

    test('ignores presses from tags by selector', async () => {
      const spy = hanbi.spy<KeyBindingHandler>();

      controller.bindKey('x', spy.handler);

      element.template = () => html`
        <div class="foo"></div>
      `;
      await element.updateComplete;

      const node = element.shadowRoot!.querySelector('div')!;

      simulateKeyPress(node, 'x');

      assert.is(spy.called, false);
    });
  });

  suite('custom ref', () => {
    let elementRef: Ref<HTMLElement>;

    setup(async () => {
      elementRef = createRef<HTMLElement>();
      controller = new KeyBindingController(element, elementRef);
      element.controllers.push(controller);
      element.template = () => html`
        <div ${ref(elementRef)} tabindex="-1">
          Hello.
        </div>
        <span></span>`;
      document.body.appendChild(element);
      await element.updateComplete;
    });

    test('calls function on key press in element', async () => {
      const spy = hanbi.spy<KeyBindingHandler>();

      controller.bindKey('x', spy.handler);

      simulateKeyPress(elementRef.value!, 'x');

      assert.is(spy.called, true);

      const ev = spy.firstCall!.args[0];

      assert.is(ev.type, 'keyup');
      assert.is(spy.callCount, 1);
    });

    test('ignores presses from unrelated elements', async () => {
      const spy = hanbi.spy<KeyBindingHandler>();

      controller.bindKey('x', spy.handler);

      const node = element.shadowRoot!.querySelector('span')!;

      simulateKeyPress(node, 'x');

      assert.is(spy.called, false);
    });
  });
});
