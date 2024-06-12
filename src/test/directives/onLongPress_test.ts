import '../util.js';

import {html} from 'lit';
import * as assert from 'uvu/assert';
import {onLongPress} from '../../main.js';
import * as hanbi from 'hanbi';
import {TestElement, delay} from '../util.js';

suite('onLongPress directive', () => {
  let element: TestElement;

  setup(async () => {
    element = document.createElement('test-element');
    document.body.appendChild(element);
  });

  teardown(() => {
    element.remove();
    hanbi.restore();
  });

  test('throws on non-element binding', async () => {
    try {
      const callback = (): void => {
        return;
      };
      element.template = () => html`
        <div>${onLongPress(callback)}</div>
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

  test('calls callback after timeout', async () => {
    const callback = hanbi.spy();
    element.template = () => html`
      <div ${onLongPress(callback.handler, 10)}></div>
    `;
    await element.updateComplete;

    const div = element.shadowRoot!.querySelector('div')!;
    const ev = new PointerEvent('pointerdown');

    div.dispatchEvent(ev);
    await delay(12);

    assert.equal(callback.called, true);
    assert.equal(callback.firstCall!.args, [ev]);
  });

  test('does not call callback if pointer up before timer', async () => {
    const callback = hanbi.spy();
    element.template = () => html`
      <div ${onLongPress(callback.handler, 10)}></div>
    `;
    await element.updateComplete;

    const div = element.shadowRoot!.querySelector('div')!;
    const pointerDown = new PointerEvent('pointerdown');
    const pointerUp = new PointerEvent('pointerup');

    div.dispatchEvent(pointerDown);
    await delay(5);
    div.dispatchEvent(pointerUp);
    await delay(10);

    assert.equal(callback.called, false);
  });

  test('does not call callback if pointer leaves before timer', async () => {
    const callback = hanbi.spy();
    element.template = () => html`
      <div ${onLongPress(callback.handler, 10)}></div>
    `;
    await element.updateComplete;

    const div = element.shadowRoot!.querySelector('div')!;
    const pointerDown = new PointerEvent('pointerdown');
    const pointerLeave = new PointerEvent('pointerleave');

    div.dispatchEvent(pointerDown);
    await delay(5);
    div.dispatchEvent(pointerLeave);
    await delay(10);

    assert.equal(callback.called, false);
  });

  test('does not call callback if disconnected', async () => {
    const callback = hanbi.spy();
    element.template = () => html`
      <div ${onLongPress(callback.handler, 10)}></div>
    `;
    await element.updateComplete;

    const div = element.shadowRoot!.querySelector('div')!;
    const ev = new PointerEvent('pointerdown');

    element.remove();

    div.dispatchEvent(ev);
    await delay(12);

    assert.equal(callback.called, false);
  });

  test('survives reconnection to dom', async () => {
    const callback = hanbi.spy();
    element.template = () => html`
      <div ${onLongPress(callback.handler, 10)}></div>
    `;
    await element.updateComplete;

    const div = element.shadowRoot!.querySelector('div')!;
    const ev = new PointerEvent('pointerdown');

    element.remove();
    document.body.appendChild(element);
    await element.updateComplete;

    div.dispatchEvent(ev);
    await delay(12);

    assert.equal(callback.called, true);
  });

  test('applies default timeout if none set', async () => {
    const callback = hanbi.spy();
    element.template = () => html`
      <div ${onLongPress(callback.handler)}></div>
    `;
    await element.updateComplete;

    const div = element.shadowRoot!.querySelector('div')!;
    const ev = new PointerEvent('pointerdown');

    div.dispatchEvent(ev);
    await delay(500);

    assert.equal(callback.called, false);

    await delay(600);

    assert.equal(callback.called, true);
  });
});
