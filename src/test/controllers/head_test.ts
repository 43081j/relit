import '../util.js';

import * as assert from 'uvu/assert';
import {html} from 'lit';
import {HeadController} from '../../main.js';
import type {TestElement} from '../util.js';

suite('HeadController', () => {
  let element: TestElement;
  let controller: HeadController;

  teardown(() => {
    element.remove();
    for (const attr of document.body.attributes) {
      document.body.removeAttribute(attr.name);
    }
    for (const attr of document.documentElement.attributes) {
      document.documentElement.removeAttribute(attr.name);
    }
    controller.removeRenderedElements();
  });

  suite('default', () => {
    setup(async () => {
      element = document.createElement('test-element') as TestElement;
      controller = new HeadController(element);
      element.controllers.push(controller);
      document.body.appendChild(element);
    });

    test('initialises to current active element', () => {
      assert.equal(controller.defaultTitle, undefined);
      assert.equal(controller.titleTemplate, undefined);
    });

    suite('setTitle', () => {
      test('sets the document title', () => {
        controller.setTitle('floof');
        assert.is(document.title, 'floof');
      });

      test('sets the templated title if a template exists', () => {
        controller.titleTemplate = 'foo - %s';
        controller.setTitle('beans');
        assert.is(document.title, 'foo - beans');
      });
    });

    suite('updateBodyAttr', () => {
      test('updates attributes on body tag', () => {
        controller.updateBodyAttr({
          'data-foo': 'bar'
        });
        assert.is(document.body.getAttribute('data-foo'), 'bar');
      });

      test('removes null attributes from tag', () => {
        document.body.setAttribute('data-foo', 'bar');
        controller.updateBodyAttr({
          'data-foo': null
        });
        assert.is(document.body.hasAttribute('data-foo'), false);
      });
    });

    suite('updateHtmlAttr', () => {
      test('updates attributes on tag', () => {
        controller.updateHtmlAttr({
          'data-foo': 'bar'
        });
        assert.is(document.documentElement.getAttribute('data-foo'), 'bar');
      });

      test('removes null attributes from tag', () => {
        document.documentElement.setAttribute('data-foo', 'bar');
        controller.updateHtmlAttr({
          'data-foo': null
        });
        assert.is(document.documentElement.hasAttribute('data-foo'), false);
      });
    });

    suite('update', () => {
      test('renders title element', () => {
        controller.update(html`<title>Foo</title>`);
        const titles = document.head.querySelectorAll('title');

        assert.is(titles.length, 1);
        assert.is(titles[0]!.outerHTML, `<title>Foo</title>`);
        assert.is(document.title, 'Foo');
      });

      test('renders base element', () => {
        controller.update(html`<base href="foo">`);
        const nodes = document.head.querySelectorAll('base');

        assert.is(nodes.length, 1);
        assert.is(nodes[0]!.outerHTML, `<base href="foo">`);
      });

      test('renders link element', () => {
        controller.update(html`<link rel="stylesheet" href="foo.css">`);
        const nodes = document.head.querySelectorAll('link[href="foo.css"]');

        assert.is(nodes.length, 1);
        assert.is(
          nodes[0]!.outerHTML,
          `<link rel="stylesheet" href="foo.css">`
        );
      });

      test('renders script element', () => {
        controller.update(html`
          <script type="module" id="foo">
            const foo = 5;
          </script>
        `);
        const nodes = document.head.querySelectorAll('script#foo');

        assert.is(nodes.length, 1);
        assert.is(
          nodes[0]!.outerHTML,
          `<script type="module" id="foo">
            const foo = 5;
          </script>`
        );
      });

      test('renders noscript element', () => {
        controller.update(html`
          <noscript id="foo">
            <meta name="waffles">
          </noscript>
        `);
        const nodes = document.head.querySelectorAll('noscript#foo');

        assert.is(nodes.length, 1);
        assert.is(
          nodes[0]!.outerHTML,
          `<noscript id="foo">
            <meta name="waffles">
          </noscript>`
        );
      });

      test('renders style element', () => {
        controller.update(html`
          <style type="text/css" id="foo">
            .foo {
              color: hotpink;
            }
          </style>
        `);
        const nodes = document.head.querySelectorAll('style#foo');

        assert.is(nodes.length, 1);
        assert.is(
          nodes[0]!.outerHTML,
          `<style type="text/css" id="foo">
            .foo {
              color: hotpink;
            }
          </style>`
        );
      });

      test('renders meta element', () => {
        controller.update(html`<meta name="waffles" id="foo">`);
        const nodes = document.head.querySelectorAll('meta#foo');

        assert.is(nodes.length, 1);
        assert.is(nodes[0]!.outerHTML, `<meta name="waffles" id="foo">`);
      });

      test('updates already rendered elements', () => {
        controller.update(html`<meta name="waffles" id="foo">`);
        controller.update(html`<meta name="wuffles" id="foo">`);

        const nodes = document.head.querySelectorAll('meta#foo');

        assert.is(nodes.length, 1);
        assert.is(nodes[0]!.outerHTML, `<meta name="wuffles" id="foo">`);
      });

      test('replaces title element if exists', () => {
        controller.update(html`<title>Foo</title>`);
        controller.update(html`<title>Bar</title>`);
        const titles = document.head.querySelectorAll('title');

        assert.is(titles.length, 1);
        assert.is(titles[0]!.textContent, 'Bar');
        assert.is(document.title, 'Bar');
      });

      test('replaces base element if exists', () => {
        controller.update(html`<base href="foo">`);
        controller.update(html`<base href="bar">`);
        const nodes = document.head.querySelectorAll('base');

        assert.is(nodes.length, 1);
        assert.is(nodes[0]!.getAttribute('href'), 'bar');
      });

      test('renders multiple elements', () => {
        controller.update(html`
          <meta name="waffles" id="foo">
          <meta name="wuffles" id="bar">
        `);
        const nodes = document.head.querySelectorAll('meta#foo, meta#bar');

        assert.is(nodes.length, 2);
        assert.is(nodes[0]!.outerHTML, `<meta name="waffles" id="foo">`);
        assert.is(nodes[1]!.outerHTML, `<meta name="wuffles" id="bar">`);
      });
    });

    suite('removeRenderedElements', () => {
      test('removes all rendered elements', () => {
        controller.update(html`
          <meta name="waffles" id="foo">
          <meta name="wuffles" id="bar">
        `);

        controller.removeRenderedElements();

        const nodes = document.head.querySelectorAll('meta#foo, meta#bar');

        assert.is(nodes.length, 0);
      });
    });
  });

  suite('with default title', () => {
    setup(async () => {
      element = document.createElement('test-element') as TestElement;
      controller = new HeadController(element);
      controller.defaultTitle = 'bleep bloop';
      element.controllers.push(controller);
      document.body.appendChild(element);
    });

    test('sets the document title to the default', () => {
      assert.equal(controller.defaultTitle, 'bleep bloop');
      assert.equal(document.title, 'bleep bloop');
    });

    test('sets the document title back to default when removing title', () => {
      controller.update(html`<title>Foo</title>`);

      assert.is(document.title, 'Foo');

      controller.removeRenderedElements();

      assert.is(document.title, 'bleep bloop');
    });
  });
});
