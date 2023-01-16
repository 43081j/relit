import type {ReactiveController, ReactiveControllerHost} from 'lit';
import type {Ref} from 'lit/directives/ref.js';

export interface ElementSize {
  width: number;
  height: number;
}

export type ElementSizeType = 'content' | 'border' | 'device';

export type ElementSizeProp =
  | 'contentBoxSize'
  | 'borderBoxSize'
  | 'devicePixelContentBoxSize';

const elementSizeToProperty: Record<ElementSizeType, ElementSizeProp> = {
  content: 'contentBoxSize',
  border: 'borderBoxSize',
  device: 'devicePixelContentBoxSize'
};

/**
 * Tracks the size of a given element
 */
export class ElementSizeController implements ReactiveController {
  public size: ElementSize;

  private __host: ReactiveControllerHost & Element;
  private __observer: ResizeObserver;
  private __ref?: Ref;
  private __type: ElementSizeType;
  private __lastElement: Element | undefined = undefined;

  /**
   * Gets the current element being observed
   * @return {Element|undefined}
   */
  private get __element(): Element | undefined {
    if (this.__ref) {
      return this.__ref.value;
    }
    return this.__host;
  }

  /**
   * @param {ReactiveControllerHost} host Host to attach to
   * @param {string} type Type of size to observe
   * @param {Ref=} ref Ref to observe rather than the host element
   */
  public constructor(
    host: ReactiveControllerHost & Element,
    type: ElementSizeType = 'content',
    ref?: Ref
  ) {
    this.__host = host;
    this.__type = type;
    this.size = {width: 0, height: 0};

    if (ref) {
      this.__ref = ref;
    }

    this.__lastElement = this.__element;

    this.__observer = new ResizeObserver((entries) => this.__onResize(entries));

    host.addController(this as ReactiveController);
  }

  /**
   * Fired when a resize occurs
   * @param {ResizeObserverEntry[]} entries Resize entries
   * @return {void}
   */
  private __onResize(entries: ResizeObserverEntry[]): void {
    const element = this.__element;
    const entry = entries.find(({target}) => target === element);

    if (!entry) {
      return;
    }

    const dimension = entry[elementSizeToProperty[this.__type]];

    this.size = {
      width: dimension.reduce((p, c) => p + c.inlineSize, 0),
      height: dimension.reduce((p, c) => p + c.blockSize, 0)
    };

    this.__host.requestUpdate();
  }

  /** @inheritdoc */
  public hostUpdated(): void {
    const element = this.__element;
    if (element !== this.__lastElement) {
      this.__lastElement = element;

      this.__observer.disconnect();

      if (element) {
        this.__observer.observe(element);
      }
    }
  }
}
