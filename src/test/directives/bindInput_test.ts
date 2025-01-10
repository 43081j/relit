import {html, PropertyDeclarations} from 'lit';
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

  test('does nothing for non-existent properties', async () => {
    element.template = () => html`
      <input ${bindInput(element, 'nonsense' as keyof BindInputDirectiveTest)}>
    `;
    await element.updateComplete;

    const node = element.shadowRoot!.querySelector('input')!;

    assert.is(node.value, '');
    assert.is(element.prop, undefined);
  });

  test('does nothing for non-existent properties (upwards)', async () => {
    element.template = () => html`
      <input ${bindInput(element, 'nonsense' as keyof BindInputDirectiveTest)}>
    `;
    await element.updateComplete;

    const node = element.shadowRoot!.querySelector('input')!;

    node.value = 'foo';
    node.dispatchEvent(new Event('input'));
    await element.updateComplete;

    assert.is(element.prop, undefined);
    assert.is(Object.prototype.hasOwnProperty.call(element, 'nonsense'), false);
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

      assert.is(node.type, 'select-multiple');
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
