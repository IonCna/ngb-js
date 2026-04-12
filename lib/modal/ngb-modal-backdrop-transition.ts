import { reflow } from "@/utils"
import type { IAugmentedJQuery } from "angular"

export function ngbModalBackdropFadeOutTransition(element: IAugmentedJQuery) {
    element.removeClass("show")
}

export function ngbModalBackdropFadeInTransition(element: IAugmentedJQuery, animation: boolean) {
    if(animation) {
        reflow(element)
    }

    element.addClass("show")
}
