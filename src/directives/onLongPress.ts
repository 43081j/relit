import {ElementPart, nothing} from 'lit';
import {
	Directive,
	directive,
	DirectiveClass,
	DirectiveResult,
	PartInfo,
	PartType,
} from 'lit/directive.js';

class LongPressDirective extends Directive {
	__element!: Element;
	__fireTimeout?: number;

	__longPressCallback?: Function;
	__cancelTimeoutMs?: number;

	constructor(partInfo: PartInfo) {
		super(partInfo);

		if (partInfo.type !== PartType.ELEMENT) {
			throw new Error(
				"Can't bind `onLongPress` directive to anything " +
					'that is not an element'
			);
		}

		this.__element = (partInfo as ElementPart).element;
	}

	render(callback: (event?: Event) => void, cancelTimeoutMs = 2000) {
		// Cancel timeout/events and discard event listeners
		this.__abort();

		this.__longPressCallback = callback;
		this.__cancelTimeoutMs = cancelTimeoutMs;

		// Because events were removed from __abort
		// we create them again
		this.__bindOnElementMouseDown = this.__onElementMouseDown.bind(this);
		this.__element.addEventListener('mousedown', this.__bindOnElementMouseDown);
		this.__bindOnElementMouseUp = this.__onElementMouseUp.bind(this);
		this.__element.addEventListener('mouseup', this.__bindOnElementMouseUp);
		this.__bindOnElementMouseLeave = this.__onElementMouseLeave.bind(this);
		this.__element.addEventListener(
			'mouseleave',
			this.__bindOnElementMouseLeave
		);

		return nothing;
	}

	__onElementMouseDown() {
		this.__initiateTimeout();
	}
	__bindOnElementMouseDown!: (event: Event) => void;

	__onElementMouseUp(e: Event) {
		// TODO: when the mouse is released and long press event
		// was accepted, we should find a way to cancel the @click
		// event listener if it exists.

		this.__cancelTimeout();
	}
	__bindOnElementMouseUp!: (event: Event) => void;

	__onElementMouseLeave() {
		this.__cancelTimeout();
	}
	__bindOnElementMouseLeave!: (event: Event) => void;

	/**
	 * Start the long press timeout,
	 * when the timeout runs out the user-defined callback is called.
	 */
	__initiateTimeout() {
		this.__fireTimeout = setTimeout(() => {
			this.__longPressCallback?.(this.__element);
		}, this.__cancelTimeoutMs);
	}

	/**
	 * Cancel the long press timeout.
	 * This function is called when the user release the mouse
	 * or when the mouse leave the element.
	 */
	__cancelTimeout() {
		if (this.__fireTimeout) {
			clearTimeout(this.__fireTimeout);
		}
	}

	/**
	 * Abort the long press timeout on special occasions.
	 */
	__abort() {
		// TODO: should call this.__abort() when the template is removed/destroyed?
		this.__cancelTimeout();
		this.__element.removeEventListener(
			'mousedown',
			this.__bindOnElementMouseDown
		);
		this.__element.removeEventListener('mouseup', this.__bindOnElementMouseUp);
		this.__element.removeEventListener(
			'mouseleave',
			this.__bindOnElementMouseLeave
		);
	}
}

const onLongPressDirective = directive(LongPressDirective);

export function onLongPress(
	callback: (event?: Event) => void,
	activateTimeoutMs = 1300
): DirectiveResult<DirectiveClass> {
	return onLongPressDirective(callback, activateTimeoutMs);
}
