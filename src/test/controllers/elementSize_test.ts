import '../util.js';

import {html} from 'lit';
import * as assert from 'uvu/assert';
import {createRef, ref} from 'lit/directives/ref.js';
import type {Ref} from 'lit/directives/ref.js';
import {ElementSizeController} from '../../main.js';
import type {TestElement} from '../util.js';

suite('DocumentVisibilityController', () => {
  let element: TestElement;
  let controller: ElementSizeController;

  setup(() => {
    element = document.createElement('test-element');
  });

  teardown(() => {
    element.remove();
  });

  suite('host element', () => {
    setup(async () => {
      controller = new ElementSizeController(element);
      element.controllers.push(controller);
      element.template = () =>
        html`${controller.size.width}x${controller.size.height}`;
      document.body.appendChild(element);
      await element.updateComplete;

      element.style.width = '200px';
      element.style.height = '200px';

      // TODO (43081j): find a cleaner way to wait the right amount
      // of time
      await new Promise((r) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(r);
        });
      });
    });

    test('initialises to current element size', () => {
      assert.equal(controller.size, {width: 200, height: 200});
      assert.equal(element.shadowRoot!.textContent, '200x200');
    });

    test('reacts to resizes', async () => {
      element.style.width = '400px';
      element.style.height = '400px';

      // TODO (43081j): find a cleaner way to wait the right amount
      // of time
      await new Promise((r) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(r);
        });
      });

      assert.equal(controller.size, {width: 400, height: 400});
      assert.equal(element.shadowRoot!.textContent, '400x400');
    });
  });

  suite('custom ref', () => {
    let elementRef: Ref<HTMLElement>;

    setup(async () => {
      elementRef = createRef<HTMLElement>();
      controller = new ElementSizeController(element, 'content', elementRef);
      element.controllers.push(controller);
      element.template = () => html` <div ${ref(elementRef)}>
        ${controller.size.width}x${controller.size.height}
      </div>`;
      document.body.appendChild(element);
      await element.updateComplete;

      const child = element.shadowRoot!.querySelector('div')!;
      child.style.width = '200px';
      child.style.height = '200px';

      // TODO (43081j): find a cleaner way to wait the right amount
      // of time
      await new Promise((r) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(r);
        });
      });
    });

    test('initialises to current element size', () => {
      assert.equal(controller.size, {width: 200, height: 200});
      assert.equal(element.shadowRoot!.textContent!.trim(), '200x200');
    });

    test('reacts to resizes', async () => {
      elementRef.value!.style.width = '400px';
      elementRef.value!.style.height = '400px';

      // TODO (43081j): find a cleaner way to wait the right amount
      // of time
      await new Promise((r) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(r);
        });
      });

      assert.equal(controller.size, {width: 400, height: 400});
      assert.equal(element.shadowRoot!.textContent!.trim(), '400x400');
    });
  });
});
