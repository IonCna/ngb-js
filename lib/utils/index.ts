import type { IAugmentedJQuery } from "angular";
export * from "@/utils/transition"

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