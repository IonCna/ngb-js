import type { IAugmentedJQuery } from "angular";

export function reflow(element: IAugmentedJQuery) {
    const [native] = Array.from(element)
    return (native || document.body).getBoundingClientRect()
}

export function getValueInRange(value: number, max: number, min = 0): number {
	return Math.max(Math.min(value, max), min);
}

export function kebabCase() {}