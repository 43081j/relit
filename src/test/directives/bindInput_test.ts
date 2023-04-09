import {html, PropertyDeclarations, type ReactiveControllerHost} from 'lit';
import * as assert from 'uvu/assert';
import {bindInput} from '../../main.js';
import {TestElementBase} from '../util.js';

/**
 * Test element for the input directive
 */
class BindInputDirectiveTest extends TestElementBase {
  public prop?: unknown;

  /** @inheritdoc */
  public static override get properties(): PropertyDeclarations {
    return {
      prop: {type: Object}
    };
  }
}

customElements.define('bind-input-directive-test', BindInputDirectiveTest);

suite('bindInput directive', () => {
  let element: BindInputDirectiveTest;

  setup(async () => {
    element = document.createElement(
      'bind-input-directive-test'
    ) as BindInputDirectiveTest;
    document.body.appendChild(element);
  });

  teardown(() => {
    element.remove();
  });

  test('throws on non-element binding', async () => {
    try {
      element.template = () => html`
        <div>${bindInput(element, 'prop')}</div>
      `;
      await element.updateComplete;
      assert.unreachable();
    } catch (err) {
      assert.is(
        (err as Error).message,
        'The `bindInput` directive must be used in an element or ' +
          'attribute binding'
      );
    }
  });

  test('survives DOM reconnect', async () => {
    element.template = () => html`
      <input ${bindInput(element, 'prop')}>
    `;
    await element.updateComplete;

    const inputNode = element.shadowRoot!.querySelector('input')!;
    element.remove();

    inputNode.value = 'xyz';
    inputNode.dispatchEvent(new Event('input'));

    assert.is(element.prop, undefined);

    document.body.appendChild(element);

    inputNode.value = 'xyz';
    inputNode.dispatchEvent(new Event('input'));

    assert.is(element.prop, 'xyz');
  });

  suite('host property', () => {
    test('handles non-existent properties', async () => {
      element.template = () => html`
        <input ${bindInput(element, 'nonsense')}>
      `;
      await element.updateComplete;

      const node = element.shadowRoot!.querySelector('input')!;

      assert.is(node.value, '');
      assert.is(element.prop, undefined);
    });

    test('handles null hosts on attribute', async () => {
      element.template = () => html`
        <input .value=${bindInput(null, 'key')}>
      `;
      await element.updateComplete;

      const input = element.shadowRoot!.querySelector('input')!;

      assert.is(input.value, 'undefined');
    });

    test('handles null hosts with non-string prop on attribute', async () => {
      element.template = () => html`
        <input .value=${bindInput(null, Symbol())}>
      `;
      await element.updateComplete;

      const input = element.shadowRoot!.querySelector('input')!;

      assert.is(input.value, 'undefined');
    });

    test('handles deep properties', async () => {
      element.template = () => html`
        <input ${bindInput(element, 'prop.foo')}>
      `;
      await element.updateComplete;

      element.prop = {foo: 'xyz'};
      await element.updateComplete;

      const inputNode = element.shadowRoot!.querySelector('input')!;

      assert.is(inputNode.value, 'xyz');
    });
  });

  suite('user input', () => {
    test('handles non-existent properties', async () => {
      element.template = () => html`
        <input ${bindInput(element, 'nonsense')}>
      `;
      await element.updateComplete;

      const node = element.shadowRoot!.querySelector('input')!;

      node.value = 'foo';
      node.dispatchEvent(new Event('input'));
      await element.updateComplete;

      assert.is(element.prop, undefined);
      assert.is(
        (element as BindInputDirectiveTest & {nonsense: string}).nonsense,
        'foo'
      );
      assert.is(element.hasOwnProperty('nonsense'), true);
    });

    test('handles non-string root properties', async () => {
      const key = Symbol();
      const obj = {
        [key]: 'foo'
      };
      element.template = () => html`
        <input ${bindInput(obj, key)}>
      `;
      await element.updateComplete;

      const input = element.shadowRoot!.querySelector('input')!;

      input.value = 'bar';
      input.dispatchEvent(new Event('input'));

      assert.is(obj[key], 'bar');
    });

    test('handles null hosts', async () => {
      element.template = () => html`
        <input ${bindInput(null, 'key')}>
      `;
      await element.updateComplete;

      const input = element.shadowRoot!.querySelector('input')!;

      input.value = 'bar';
      input.dispatchEvent(new Event('input'));
    });

    test('handles deep properties', async () => {
      element.template = () => html`
        <input ${bindInput(element, 'prop.foo')}>
      `;
      await element.updateComplete;

      const input = element.shadowRoot!.querySelector('input')!;

      input.value = 'bar';
      input.dispatchEvent(new Event('input'));

      assert.is((element.prop as {foo: string}).foo, 'bar');
    });
  });

  suite('options.host', () => {
    let updateRequestCount: number;

    setup(async () => {
      updateRequestCount = 0;

      const host: ReactiveControllerHost = {
        requestUpdate() {
          updateRequestCount++;
        },
        addController() {
          return;
        },
        removeController() {
          return;
        },
        updateComplete: Promise.resolve(true)
      };
      element.template = () => html`
        <input .value=${bindInput(element, 'prop', {host})}>
      `;
      await element.updateComplete;
    });

    test('updates host on change', async () => {
      assert.is(updateRequestCount, 0);

      const input = element.shadowRoot!.querySelector('input')!;
      input.value = 'foo';
      input.dispatchEvent(new Event('input'));

      assert.is(updateRequestCount, 1);
    });
  });

  suite('options.validate', () => {
    let valid: boolean;

    setup(async () => {
      valid = true;
      const validate = () => valid;
      element.template = () => html`
        <input ${bindInput(element, 'prop', {validate})}>
      `;
      await element.updateComplete;
    });

    test('host value does not change if invalid', async () => {
      valid = false;

      const inputNode = element.shadowRoot!.querySelector('input')!;

      inputNode.value = 'xyz';
      inputNode.dispatchEvent(new Event('input'));
      await element.updateComplete;

      assert.is(element.prop, undefined);
    });

    test('host value is updated if valid', async () => {
      const inputNode = element.shadowRoot!.querySelector('input')!;

      inputNode.value = 'xyz';
      inputNode.dispatchEvent(new Event('input'));
      await element.updateComplete;

      assert.is(element.prop, 'xyz');
    });
  });

  suite('<input> by property', () => {
    setup(async () => {
      element.template = () => html`
        <input .value=${bindInput(element, 'prop')}>
      `;
      await element.updateComplete;
    });

    test('propagates value downwards', async () => {
      element.prop = 'xyz';
      await element.updateComplete;

      const inputNode = element.shadowRoot!.querySelector('input')!;

      assert.is(inputNode.value, 'xyz');
    });

    test('propagates value upwards', async () => {
      const inputNode = element.shadowRoot!.querySelector('input')!;

      inputNode.value = 'xyz';
      inputNode.dispatchEvent(new Event('input'));
      await element.updateComplete;

      assert.is(element.prop, 'xyz');
    });
  });

  suite('<input> by attribute', () => {
    setup(async () => {
      element.template = () => html`
        <input value=${bindInput(element, 'prop')}>
      `;
      await element.updateComplete;
    });

    test('propagates value downwards', async () => {
      element.prop = 'xyz';
      await element.updateComplete;

      const inputNode = element.shadowRoot!.querySelector('input')!;

      assert.is(inputNode.value, 'xyz');
    });

    test('propagates value upwards', async () => {
      const inputNode = element.shadowRoot!.querySelector('input')!;

      inputNode.value = 'xyz';
      inputNode.dispatchEvent(new Event('input'));
      await element.updateComplete;

      assert.is(element.prop, 'xyz');
    });
  });

  suite('<input>', () => {
    setup(async () => {
      element.template = () => html`
        <input ${bindInput(element, 'prop')}>
      `;
      await element.updateComplete;
    });

    test('propagates value downwards', async () => {
      element.prop = 'xyz';
      await element.updateComplete;

      const inputNode = element.shadowRoot!.querySelector('input')!;

      assert.is(inputNode.value, 'xyz');
    });

    test('propagates value upwards', async () => {
      const inputNode = element.shadowRoot!.querySelector('input')!;

      inputNode.value = 'xyz';
      inputNode.dispatchEvent(new Event('input'));
      await element.updateComplete;

      assert.is(element.prop, 'xyz');
    });

    test('sets empty string on undefined value', async () => {
      element.prop = 'xyz';
      await element.updateComplete;
      element.prop = undefined;
      await element.updateComplete;

      const inputNode = element.shadowRoot!.querySelector('input')!;

      assert.is(inputNode.value, '');
    });
  });

  suite('<input type="range">', () => {
    setup(async () => {
      element.template = () => html`
        <input ${bindInput(element, 'prop')} type="range">
      `;
      await element.updateComplete;
    });

    test('propagates value downwards', async () => {
      element.prop = 10;
      await element.updateComplete;

      const node = element.shadowRoot!.querySelector('input')!;

      assert.is(node.value, '10');
    });

    test('propagates value upwards', async () => {
      const node = element.shadowRoot!.querySelector('input')!;

      node.value = '20';
      node.dispatchEvent(new Event('change'));
      await element.updateComplete;

      assert.is(element.prop, 20);
    });
  });

  suite('<input type="number">', () => {
    setup(async () => {
      element.template = () => html`
        <input ${bindInput(element, 'prop')} type="number">
      `;
      await element.updateComplete;
    });

    test('propagates value downwards', async () => {
      element.prop = 100;
      await element.updateComplete;

      const node = element.shadowRoot!.querySelector('input')!;

      assert.is(node.value, '100');
    });

    test('propagates value upwards', async () => {
      const node = element.shadowRoot!.querySelector('input')!;

      node.value = '200';
      node.dispatchEvent(new Event('change'));
      await element.updateComplete;

      assert.is(element.prop, 200);
    });
  });

  suite('<input type="checkbox">', () => {
    setup(async () => {
      element.template = () => html`
        <input ${bindInput(element, 'prop')} type="checkbox">
      `;
      await element.updateComplete;
    });

    test('propagates value downwards', async () => {
      element.prop = true;
      await element.updateComplete;

      const node = element.shadowRoot!.querySelector('input')!;

      assert.is(node.checked, true);
    });

    test('propagates value upwards', async () => {
      const node = element.shadowRoot!.querySelector('input')!;

      node.checked = true;
      node.dispatchEvent(new Event('change'));
      await element.updateComplete;

      assert.is(element.prop, true);
    });
  });

  suite('<select>', () => {
    setup(async () => {
      element.template = () => html`
        <select ${bindInput(element, 'prop')}>
          <option>xyz</option>
        </select>
      `;
      await element.updateComplete;
    });

    test('propagates value downwards', async () => {
      element.prop = 'xyz';
      await element.updateComplete;

      const node = element.shadowRoot!.querySelector('select')!;

      assert.is(node.value, 'xyz');
    });

    test('propagates value upwards', async () => {
      const node = element.shadowRoot!.querySelector('select')!;

      node.value = 'xyz';
      node.dispatchEvent(new Event('change'));
      await element.updateComplete;

      assert.is(element.prop, 'xyz');
    });

    test('handles nullish values downwards', async () => {
      element.prop = null;
      await element.updateComplete;

      const node = element.shadowRoot!.querySelector('select')!;

      assert.is(node.value, '');
    });
  });

  suite('<select multiple>', () => {
    setup(async () => {
      element.template = () => html`
        <select ${bindInput(element, 'prop')} multiple>
          <option>808</option>
          <option>303</option>
        </select>
      `;
      await element.updateComplete;
    });

    test('propagates value downwards', async () => {
      element.prop = ['808', '303'];
      await element.updateComplete;

      const node = element.shadowRoot!.querySelector('select')!;
      const opts = [...node.selectedOptions].map((opt) => opt.value);

      assert.is(opts.length, 2);
      assert.equal(opts, ['808', '303']);
    });

    test('propagates value upwards', async () => {
      const node = element.shadowRoot!.querySelector('select')!;
      const opts = [...node.options];

      opts[0]!.selected = true;
      opts[1]!.selected = true;
      node.dispatchEvent(new Event('change'));
      await element.updateComplete;

      assert.equal(element.prop, ['808', '303']);
    });

    test('handles non-array value downwards', async () => {
      element.prop = '808';
      await element.updateComplete;

      const node = element.shadowRoot!.querySelector('select')!;
      const opts = [...node.selectedOptions].map((opt) => opt.value);

      assert.is(opts.length, 1);
      assert.equal(opts, ['808']);
    });
  });

  suite('<textarea>', () => {
    setup(async () => {
      element.template = () => html`
        <textarea ${bindInput(element, 'prop')}></textarea>
      `;
      await element.updateComplete;
    });

    test('propagates value downwards', async () => {
      element.prop = 'xyz';
      await element.updateComplete;

      const node = element.shadowRoot!.querySelector('textarea')!;

      assert.is(node.value, 'xyz');
    });

    test('propagates value upwards', async () => {
      const node = element.shadowRoot!.querySelector('textarea')!;

      node.value = 'xyz';
      node.dispatchEvent(new Event('input'));
      await element.updateComplete;

      assert.is(element.prop, 'xyz');
    });

    test('sets empty string on undefined value', async () => {
      element.prop = 'xyz';
      await element.updateComplete;
      element.prop = undefined;
      await element.updateComplete;

      const node = element.shadowRoot!.querySelector('textarea')!;

      assert.is(node.value, '');
    });
  });
});
