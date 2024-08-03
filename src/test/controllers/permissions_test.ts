import '../util.js';

import {html, ReactiveController} from 'lit';
import * as assert from 'uvu/assert';
import * as hanbi from 'hanbi';
import {PermissionsController} from '../../main.js';
import type {TestElement} from '../util.js';

suite('PermissionsController', () => {
  let element: TestElement;
  let controller: PermissionsController;
  let permissionStub: hanbi.Stub<typeof navigator.permissions.query>;
  let eventSpy: hanbi.Stub<(name: string, handler: unknown) => void>;
  let mockStatus: PermissionStatus;
  let mockState: PermissionState;
  let permissionResolver: (state: PermissionStatus) => void;

  setup(async () => {
    eventSpy = hanbi.spy();
    mockState = 'prompt';
    mockStatus = {
      name: 'geolocation',
      addEventListener: eventSpy.handler,
      get state() {
        return mockState;
      }
    } as PermissionStatus;
    permissionStub = hanbi.stubMethod(navigator.permissions, 'query');
    permissionStub.callsFake(() => {
      return new Promise<PermissionStatus>((res) => {
        permissionResolver = res;
      });
    });
    element = document.createElement('test-element') as TestElement;
    controller = new PermissionsController(element, 'geolocation');
    element.controllers.push(controller as ReactiveController);
    element.template = () => html`${controller.state}`;
    document.body.appendChild(element);
    await element.updateComplete;
  });

  teardown(() => {
    element.remove();
    hanbi.restore();
  });

  test('initialises to pending', () => {
    assert.equal(controller.state, 'pending');
    assert.equal(element.shadowRoot!.textContent, 'pending');
  });

  test('changes from pending to prompt', async () => {
    permissionResolver(mockStatus);
    // TODO (43081j): be sure why two renders happen here
    await element.updateComplete;
    await element.updateComplete;
    assert.equal(controller.state, 'prompt');
    assert.equal(element.shadowRoot!.textContent, 'prompt');
  });

  test('observes permission changes', async () => {
    permissionResolver(mockStatus);
    await element.updateComplete;

    const changeHandler = [...eventSpy.calls].find(
      (c) => c.args[0] === 'change'
    )!.args[1];

    mockState = 'granted';
    (changeHandler as () => void)();

    await element.updateComplete;
    assert.equal(controller.state, 'granted');
    assert.equal(element.shadowRoot!.textContent, 'granted');
  });
});
