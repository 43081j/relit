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
		this.__abort();
		this.__longPressCallback = callback;
		this.__cancelTimeoutMs = cancelTimeoutMs;
		this.__bindInitialTimeout = this.__initiateTimeout.bind(this)
		this.__element.addEventListener('mousedown', this.__bindInitialTimeout);
		this.__bindCancelTimeout = this.__cancelTimeout.bind(this)
		this.__element.addEventListener('mouseup', this.__bindCancelTimeout);
		this.__element.addEventListener('mouseleave', this.__bindCancelTimeout);
		return nothing;
	}

	__bindInitialTimeout!: (e: Event) => void;
	__initiateTimeout() {
		this.__fireTimeout = setTimeout(() => {
			this.__longPressCallback?.(this.__element);
		}, this.__cancelTimeoutMs);
	}
	__bindCancelTimeout!: (e: Event) => void;
	__cancelTimeout() {
		if (this.__fireTimeout) {
			clearTimeout(this.__fireTimeout);
		}
	}

	__abort() {
		this.__cancelTimeout();
		// Are removeEventListener's needed here?
		this.__element.removeEventListener('mousedown', this.__bindInitialTimeout);
		this.__element.removeEventListener('mouseup', this.__bindCancelTimeout);
		this.__element.removeEventListener('mouseleave', this.__bindCancelTimeout);
	}
}

const onLongPressDirective = directive(LongPressDirective);

export function onLongPress(
	callback: (event?: Event) => void,
	activateTimeoutMs = 1300
): DirectiveResult<DirectiveClass> {
	return onLongPressDirective(callback, activateTimeoutMs);
}
