import type {ReactiveController, ReactiveControllerHost} from 'lit';

/**
 * The permission state can be either 'denied', 'granted' or 'prompt'.
 * There is a brief moment until the state is resolved as the query for this state is asynchronous.
 * To represent this initial state, 'pending' is added to PermissionState.
 */
export type AsyncPermissionState = 'pending' | PermissionState;

/**
 * Tracks the status of a given browser permission
 */
export class PermissionsController {
  /**
   * Gets the current permission state or 'pending'
   * @return {AsyncPermissionState}
   */
  public get state(): AsyncPermissionState {
    return this.__status?.state ?? 'pending';
  }

  private __host: ReactiveControllerHost;
  private __status?: PermissionStatus;

  /**
   * @param {ReactiveControllerHost} host Host to attach to
   * @param {PermissionName} name Permission to track
   */
  public constructor(host: ReactiveControllerHost, name: PermissionName) {
    this.__host = host;

    this.__initialisePermissions(name);

    host.addController(this as ReactiveController);
  }

  /**
   * Initialises the permissions state and event handling
   * @param {string} name Permission name
   * @return {Promise<void>}
   */
  protected async __initialisePermissions(name: PermissionName): Promise<void> {
    this.__status = await navigator.permissions.query({name});
    this.__status.addEventListener('change', this.__onPermissionChanged);
    // Implicitly request for an update to reflect the initial state
    this.__host.requestUpdate();
  }

  protected __onPermissionChanged: () => void = (): void => {
    this.__host.requestUpdate();
  };
}
