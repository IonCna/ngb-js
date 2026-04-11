import type { IAugmentedJQuery } from "angular";
import angular from "angular";
export {
    type NgbTransitionStartFn,
    type NgbTransitionOptions,
    ngbCompleteTransition,
    ngbRunTransition
} from "@/utils/transition/ngb-transition"
export { ngbCollapsingTransition } from "@/utils/transition/ngb-collapse-transition"
export type { INgbEvent } from "@/utils/transition"

export function reflow(element: IAugmentedJQuery) {
    return (toNativeElement(element) || document.body).getBoundingClientRect()
}

export function getValueInRange(value: number, max: number, min = 0): number {
    return Math.max(Math.min(value, max), min);
}

export function toNativeElement(element: IAugmentedJQuery) {
    const [native] = Array.from(element)
    return native
}

export function isInteger(value: any): value is number {
    return typeof value === 'number' && isFinite(value) && Math.floor(value) === value && angular.isNumber(value);
}

export function padNumber(value: number) {
    if (angular.isNumber(value)) {
        return `0${value}`.slice(-2);
    }

    return '';
}

export function toInteger(value: any): number {
	return parseInt(`${value}`, 10);
}

export function isNumber(value: any): value is number {
	return !isNaN(toInteger(value));
}

export function kebabCase() { }
