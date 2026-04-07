import type { IAugmentedJQuery } from "angular";

export function reflow(element: IAugmentedJQuery) {
    const [native] = Array.from(element)
    return (native || document.body).getBoundingClientRect()
}

export function kebabCase() {}