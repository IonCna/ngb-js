import type { IAugmentedJQuery } from "angular";
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

export function kebabCase() {}
