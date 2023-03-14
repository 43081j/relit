import '../util.js';

import {html} from 'lit';
import * as hanbi from 'hanbi';
import * as assert from 'uvu/assert';
import {SlotController} from '../../main.js';
import type {TestElement} from '../util.js';
import {ref, createRef} from 'lit/directives/ref.js';

suite('SlotController', () => {
  let element: TestElement;
  let controller: SlotController;

  setup(() => {
    element = document.createElement('test-element');
  });

  teardown(() => {
    element.remove();
  });

  setup(async () => {
    controller = new SlotController(element);
    element.controllers.push(controller);
    element.template = () => html`<slot></slot>`;
    document.body.appendChild(element);
    await element.updateComplete;
  });

  suite('addListener', () => {
    test('calls listener with slotted elements', async () => {
      const spy = hanbi.spy<(node: Element) => void>();

      controller.addListener('*', '*', spy.handler);

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

    test('does not call listener for other slot', async () => {
      const spy = hanbi.spy<(node: Element) => void>();

      element.template = () => html`
        <slot name="test"></slot>
        <slot name="test2"></slot>
      `;
      await element.updateComplete;

      controller.addListener('test', '*', spy.handler);

      element.innerHTML = `
        <span slot="test2">foo</span>
      `;
      await element.updateComplete;

      assert.is(spy.callCount, 0);
    });

    test('simple selector matches elements', async () => {
      const spy = hanbi.spy<(node: HTMLSpanElement) => void>();

      controller.addListener('*', 'span', spy.handler);

      element.innerHTML = '<span>foo</span><div>bar</div>';
      await element.updateComplete;

      const spanNode = element.querySelector('span')!;

      assert.is(spy.callCount, 1);

      const firstCall = spy.getCall(0);

      assert.is(firstCall.args[0], spanNode);
    });

    test('complex selector matches elements', async () => {
      const spy = hanbi.spy<(node: Element) => void>();

      controller.addListener('*', 'span,div', spy.handler);

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

    test('observes element changes', async () => {
      const spy = hanbi.spy<(node: Element) => void>();

      controller.addListener('*', '*', spy.handler);

      element.template = () => html`<div><slot></slot></div>`;
      await element.updateComplete;

      element.innerHTML = '<span>foo</span><div>bar</div>';
      await element.updateComplete;

      assert.is(spy.callCount, 2);
    });

    test('can specify exact slot by name', async () => {
      const spy = hanbi.spy<(node: Element) => void>();

      element.template = () => html`<slot name="test"></slot>`;
      await element.updateComplete;

      controller.addListener('test', '*', spy.handler);

      element.innerHTML = '<span slot="test">foo</span><div>bar</div>';
      await element.updateComplete;

      const spanNode = element.querySelector('span')!;

      assert.is(spy.callCount, 1);

      const firstCall = spy.getCall(0);

      assert.is(firstCall.args[0], spanNode);
    });

    test('can specify exact slot by ref', async () => {
      const spy = hanbi.spy<(node: Element) => void>();
      const slotRef = createRef<HTMLSlotElement>();

      element.template = () => html`
        <slot name="test" ${ref(slotRef)}></slot>
      `;
      await element.updateComplete;

      controller.addListener(slotRef, '*', spy.handler);

      element.innerHTML = '<span slot="test">foo</span><div>bar</div>';
      await element.updateComplete;

      const spanNode = element.querySelector('span')!;

      assert.is(spy.callCount, 1);

      const firstCall = spy.getCall(0);

      assert.is(firstCall.args[0], spanNode);
    });

    test('can specify default slot', async () => {
      const spy = hanbi.spy<(node: Element) => void>();

      controller.addListener('[default]', '*', spy.handler);

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
  });

  suite('has', () => {
    test('false if no slot name', async () => {
      assert.is(controller.has(''), false);
    });

    test('true if slot has elements', async () => {
      element.template = () => html`
        <slot name="test"></slot>
      `;
      await element.updateComplete;

      assert.is(controller.has('test'), false);

      element.innerHTML = `
        <span slot="test">foo</span>
      `;

      assert.is(controller.has('test'), true);
    });

    test('can pass slot as ref', async () => {
      const slotRef = createRef<HTMLSlotElement>();

      element.template = () => html`
        <slot name="test" ${ref(slotRef)}></slot>
      `;
      await element.updateComplete;

      assert.is(controller.has(slotRef), false);

      element.innerHTML = `
        <span slot="test">foo</span>
      `;

      assert.is(controller.has(slotRef), true);
    });

    test('true if any slot has elements (slot=*)', async () => {
      element.template = () => html`
        <slot name="test"></slot>
        <slot></slot>
      `;
      await element.updateComplete;

      assert.is(controller.has('*'), false);

      element.innerHTML = `
        <span slot="test">foo</span>
        <span>bar</span>
      `;

      assert.is(controller.has('*'), true);
    });

    test('true if any slot has matching elements (slot=*)', async () => {
      element.template = () => html`
        <slot name="test"></slot>
        <slot></slot>
      `;
      await element.updateComplete;

      assert.is(controller.has('*', 'span'), false);

      element.innerHTML = `
        <div slot="test">foo</div>
        <span>bar</span>
      `;

      assert.is(controller.has('*', 'span'), true);
    });

    test('true if slot has matching elements', async () => {
      element.template = () => html`<slot name="test"></slot>`;
      await element.updateComplete;

      element.innerHTML = '<span slot="test">foo</span>';

      assert.is(controller.has('test', 'span'), true);
      assert.is(controller.has('test', 'div'), false);
    });

    test('true if default slot has elements', () => {
      assert.is(controller.has('[default]'), false);

      element.innerHTML = '<span>foo</span>';

      assert.is(controller.has('[default]'), true);
    });

    test('false if not the specified slot', async () => {
      element.template = () => html`
        <slot name="test"></slot>
        <slot name="test2"></slot>
      `;
      await element.updateComplete;

      assert.is(controller.has('test'), false);

      element.innerHTML = `
        <div slot="test2">foo</div>
      `;

      assert.is(controller.has('test'), false);
    });

    test('triggers re-render when condition changes', async () => {
      element.template = () => html`
        <slot></slot>
        <span>${String(controller.has('*'))}</span>
      `;
      await element.updateComplete;

      const span = element.shadowRoot!.querySelector('span')!;

      assert.is(span.textContent, 'false');

      element.innerHTML = '<span>foo</span>';
      await element.updateComplete;
      await element.updateComplete;

      assert.is(span.textContent, 'true');
    });

    test('handles re-renders with conditional has() calls', async () => {
      let flag = true;

      element.template = () => html`
        <slot></slot>
        <span>${flag ? String(controller.has('*')) : 'nothing'}</span>
      `;
      await element.updateComplete;

      const span = element.shadowRoot!.querySelector('span')!;

      assert.is(span.textContent, 'false');

      flag = false;
      element.requestUpdate();
      await element.updateComplete;

      assert.is(span.textContent, 'nothing');

      flag = true;
      element.requestUpdate();
      await element.updateComplete;

      assert.is(span.textContent, 'false');

      element.innerHTML = '<span>foo</span>';
      await element.updateComplete;
      await element.updateComplete;

      assert.is(span.textContent, 'true');
    });
  });
});
