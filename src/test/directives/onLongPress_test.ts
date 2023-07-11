import '../util.js';
import {TestElement, sleep} from '../util.js';
import {html} from 'lit';
import {ref, createRef} from 'lit/directives/ref.js';
import * as assert from 'uvu/assert';
import * as hanbi from 'hanbi';
import {onLongPress} from '../../main.js';

suite('onLongPress directive', function () {
  let element: TestElement;

  this.timeout(5000);

  setup(async () => {
    element = document.createElement('test-element');
    document.body.appendChild(element);
  });

  teardown(() => {
    element.remove();
  });

  test('throws on non-element binding', async () => {
    try {
      element.template = () => html`
        <div>${onLongPress(() => {})}</div>
      `;
      await element.updateComplete;
      assert.unreachable();
    } catch (err) {
      assert.is(
        (err as Error).message,
        'The `onLongPress` directive must be used in an element binding'
      );
    }
  });

  test('does call callback when long press requirement is met', async () => {
    const spy = hanbi.spy();
    const timeoutMs = 500;

    const targetRef = createRef();

    element.template = () => html`
      <div
			${ref(targetRef)}
			${onLongPress(spy.handler, timeoutMs)}
		></div>
    `;
    await element.updateComplete;
    const target = targetRef.value as HTMLDivElement;

    target.dispatchEvent(new PointerEvent('pointerdown'));
    await sleep(timeoutMs - 10); // under timeoutMs: not called
    target.dispatchEvent(new PointerEvent('pointerup'));
    assert.is(spy.called, false);

    target.dispatchEvent(new PointerEvent('pointerdown'));
    await sleep(timeoutMs + 10); // over timeoutMs: called
    target.dispatchEvent(new PointerEvent('pointerup'));
    assert.is(spy.called, true);
  });

  test('pointer leave interrupts the long press timeout', async () => {
    const spy = hanbi.spy();
    const timeoutMs = 500;
    const interruptPadding = 100;

    const targetRef = createRef();

    element.template = () => html`
      <div
			${ref(targetRef)}
			${onLongPress(spy.handler, timeoutMs)}
		></div>
    `;
    await element.updateComplete;
    const target = targetRef.value as HTMLDivElement;

    target.dispatchEvent(new PointerEvent('pointerdown'));
    // Interrupts just before the timeout
    await sleep(timeoutMs - interruptPadding);
    target.dispatchEvent(new PointerEvent('pointerleave'));
	 // Make sure we wait what would normally trigger the callback.
    await sleep(interruptPadding + 50);
    target.dispatchEvent(new PointerEvent('pointerup'));
    assert.is(spy.called, false);
  });
});
