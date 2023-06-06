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
	#element!: Element;
	#fireTimeout?: number;

	#longPressCallback?: Function;
	#cancelTimeoutMs?: number;

	constructor(partInfo: PartInfo) {
		super(partInfo);

		if (partInfo.type !== PartType.ELEMENT) {
			throw new Error(
				"Can't bind `onLongPress` directive to anything " +
					'that is not an element'
			);
		}

		this.#element = (partInfo as ElementPart).element;
	}

	render(callback: (event?: Event) => void, cancelTimeoutMs = 2000) {
		this.#abort();
		this.#longPressCallback = callback;
		this.#cancelTimeoutMs = cancelTimeoutMs;
		this.#element.addEventListener('mousedown', this.#initiateTimeout);
		this.#element.addEventListener('mouseup', this.#cancelTimeout);
		this.#element.addEventListener('mouseleave', this.#cancelTimeout);
		return nothing;
	}

	#initiateTimeout() {
		this.#fireTimeout = setTimeout(() => {
			this.#longPressCallback?.(this.#element);
		}, this.#cancelTimeoutMs);
	}
	#cancelTimeout() {
		if (this.#fireTimeout) {
			clearTimeout(this.#fireTimeout);
		}
	}

	#abort() {
		this.#cancelTimeout();
		// Are removeEventListener's needed here?
		this.#element.removeEventListener('mousedown', this.#initiateTimeout);
		this.#element.removeEventListener('mouseup', this.#cancelTimeout);
		this.#element.removeEventListener('mouseleave', this.#cancelTimeout);
	}
}

const onLongPressDirective = directive(LongPressDirective);

export function onLongPress(
	callback: (event?: Event) => void,
	activateTimeoutMs = 1300
): DirectiveResult<DirectiveClass> {
	return onLongPressDirective(callback, activateTimeoutMs);
}
