import type {ReactiveController, ReactiveControllerHost} from 'lit';
import type {Ref} from 'lit/directives/ref.js';
import {ElementTrackingController} from '../_internal/elementTracking.js';

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
export class ElementSizeController extends ElementTrackingController {
  public size: ElementSize;

  private __observer: ResizeObserver;
  private __type: ElementSizeType;

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
    super(host, ref);
    this.__type = type;
    this.size = {width: 0, height: 0};

    this.__observer = new ResizeObserver((entries) => this.__onResize(entries));

    host.addController(this as ReactiveController);
  }

  /**
   * Fired when a resize occurs
   * @param {ResizeObserverEntry[]} entries Resize entries
   * @return {void}
   */
  private __onResize(entries: ResizeObserverEntry[]): void {
    const element = this._element;
    const entry = entries.find(({target}) => target === element);

    if (!entry) {
      return;
    }

    const dimension = entry[elementSizeToProperty[this.__type]];

    this.size = {
      width: dimension.reduce((p, c) => p + c.inlineSize, 0),
      height: dimension.reduce((p, c) => p + c.blockSize, 0)
    };

    this._host.requestUpdate();
  }

  /** @inheritdoc */
  protected override _onElementChanged(): void {
    super._onElementChanged();

    this.__observer.disconnect();

    const element = this._element;

    if (element) {
      this.__observer.observe(element);
    }
  }
}
