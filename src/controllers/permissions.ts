import type {ReactiveController, ReactiveControllerHost} from 'lit';

/**
 * Tracks the status of a given browser permission
 */
export class PermissionsController {
  /**
   * Gets the current permission state
   * @return {PermissionState}
   */
  public get state(): PermissionState {
    return this.__status?.state ?? 'prompt';
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
  }

  protected __onPermissionChanged: () => void = (): void => {
    this.__host.requestUpdate();
  };
}
