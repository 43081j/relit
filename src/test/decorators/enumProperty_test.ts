import {html} from 'lit';
import * as assert from 'uvu/assert';
import {enumProperty} from '../../main.js';
import {TestElementBase} from '../util.js';

/**
 * Basic test case
 */
class BasicEnumElement extends TestElementBase {
  @enumProperty({
    values: ['foo', 'bar']
  })
  public foo?: string;
}

customElements.define('basic-enum-test', BasicEnumElement);

/**
 * With default
 */
class DefaultValueEnumElement extends TestElementBase {
  @enumProperty({
    values: ['foo', 'bar'],
    defaultValue: 'foo'
  })
  public foo?: string;
}

customElements.define('default-value-enum-test', DefaultValueEnumElement);

/**
 * With lit options
 */
class LitEnumElement extends TestElementBase {
  @enumProperty(
    {
      values: ['foo', 'bar']
    },
    {
      attribute: 'foo-foo'
    }
  )
  public foo?: string;
}

customElements.define('lit-enum-test', LitEnumElement);

suite('enumProperty decorator', () => {
  suite('basic', () => {
    let element: BasicEnumElement;

    setup(async () => {
      element = document.createElement('basic-enum-test') as BasicEnumElement;
      element.template = () => html`${element.foo}`;
      document.body.appendChild(element);
      await element.updateComplete;
    });

    teardown(() => {
      element.remove();
    });

    test('renders valid value', async () => {
      assert.is(element.shadowRoot!.textContent, '');

      element.foo = 'foo';
      await element.updateComplete;

      assert.is(element.shadowRoot!.textContent, 'foo');
      assert.is(element.foo, 'foo');
    });

    test('clears when invalid', async () => {
      element.foo = 'nonsense';
      await element.updateComplete;

      assert.is(element.shadowRoot!.textContent, '');
      assert.is(element.foo, undefined);
    });
  });

  suite('with default value', () => {
    let element: DefaultValueEnumElement;

    setup(async () => {
      element = document.createElement(
        'default-value-enum-test'
      ) as DefaultValueEnumElement;
      element.template = () => html`${element.foo}`;
      document.body.appendChild(element);
      await element.updateComplete;
    });

    teardown(() => {
      element.remove();
    });

    test('renders default value when invalid', async () => {
      element.foo = 'nonsense';
      await element.updateComplete;

      assert.is(element.shadowRoot!.textContent, 'foo');
      assert.is(element.foo, 'foo');
    });
  });

  suite('with lit options', () => {
    let element: LitEnumElement;

    setup(async () => {
      element = document.createElement('lit-enum-test') as LitEnumElement;
      element.template = () => html`${element.foo}`;
      document.body.appendChild(element);
      await element.updateComplete;
    });

    teardown(() => {
      element.remove();
    });

    test('respects lit options', async () => {
      element.setAttribute('foo-foo', 'bar');
      await element.updateComplete;

      assert.is(element.shadowRoot!.textContent, 'bar');
      assert.is(element.foo, 'bar');
    });
  });
});
