import '../util.js';

import {html} from 'lit';
import * as hanbi from 'hanbi';
import * as assert from 'uvu/assert';
import {createRef, ref} from 'lit/directives/ref.js';
import type {Ref} from 'lit/directives/ref.js';
import {SlotController} from '../../main.js';
import type {TestElement} from '../util.js';

suite('SlotController', () => {
  let element: TestElement;
  let controller: SlotController;
  let elementRef: Ref<HTMLElement>;

  setup(() => {
    element = document.createElement('test-element');
  });

  teardown(() => {
    element.remove();
  });

  setup(async () => {
    elementRef = createRef<HTMLElement>();
    controller = new SlotController(element, elementRef);
    element.controllers.push(controller);
    element.template = () => html`<slot ${ref(elementRef)}></slot>`;
    document.body.appendChild(element);
    await element.updateComplete;
  });

  suite('addListener', () => {
    test('calls listener with slotted elements', async () => {
      const spy = hanbi.spy<(node: Element) => void>();

      controller.addListener('*', spy.handler);

      element.innerHTML = '<span>foo</span><div>bar</div>';
      await element.updateComplete;

      const spanNode = element.querySelector('span')!;
      const divNode = element.querySelector('div')!;

      assert.is(spy.callCount, 2);

      const firstCall = spy.getCall(0);
      const secondCall = spy.getCall(1);

      assert.is(firstCall.args[0], spanNode);
      assert.is(secondCall.args[0], divNode);
    });

    suite('options.selector', () => {
      test('simple selector matches elements', async () => {
        const spy = hanbi.spy<(node: HTMLSpanElement) => void>();

        controller.addListener('span', spy.handler);

        element.innerHTML = '<span>foo</span><div>bar</div>';
        await element.updateComplete;

        const spanNode = element.querySelector('span')!;

        assert.is(spy.callCount, 1);

        const firstCall = spy.getCall(0);

        assert.is(firstCall.args[0], spanNode);
      });

      test('complex selector matches elements', async () => {
        const spy = hanbi.spy<(node: Element) => void>();

        controller.addListener('span,div', spy.handler);

        element.innerHTML = '<span>foo</span><div>bar</div><h1>baz</h1>';
        await element.updateComplete;

        const spanNode = element.querySelector('span')!;
        const divNode = element.querySelector('div')!;

        assert.is(spy.callCount, 2);

        const firstCall = spy.getCall(0);
        const secondCall = spy.getCall(1);

        assert.is(firstCall.args[0], spanNode);
        assert.is(secondCall.args[0], divNode);
      });
    });

    test('observes element changes', async () => {
      const spy = hanbi.spy<(node: Element) => void>();

      controller.addListener('*', spy.handler);

      element.template = () =>
        html`<div><slot ${ref(elementRef)}></slot></div>`;
      await element.updateComplete;

      element.innerHTML = '<span>foo</span><div>bar</div>';
      await element.updateComplete;

      assert.is(spy.callCount, 2);
    });
  });
});
