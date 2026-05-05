import type { IAugmentedJQuery } from "angular";
import angular from "angular";
import { reflow, toNativeElement } from "@ngb/utils"

type Dimension = 'width' | 'height'

export interface NgbCollapseCtx {
    direction: 'show' | 'hide'
    dimension: Dimension
    maxSize?: string;
}

function measureCollapsingElementDimensionPx(element: IAugmentedJQuery, dimension: Dimension): string {
    if (typeof navigator === "undefined") {
        return '0px'
    }

    const hasShowClass = element.hasClass("show")
    if (!hasShowClass) {
        element.addClass("show")
    }

    element.css({ [dimension]: "" })
    const dimensionSize = toNativeElement(element).getBoundingClientRect()[dimension] + 'px'

    if (!hasShowClass) {
        element.removeClass("show")
    }

    return dimensionSize
}

export function ngbCollapsingTransition(element: IAugmentedJQuery, animation: boolean, context: NgbCollapseCtx) {
    const setInitialClasses = () => {
        element.addClass("collapse")

        if (context.direction == "show") {
            element.addClass("show")
            return
        }

        element.removeClass("show")
    }

    if (!animation) {
        setInitialClasses()
        return
    }

    if (!context.maxSize) {
        const maxSize = measureCollapsingElementDimensionPx(element, context.dimension)
        angular.extend(context, { maxSize });

        element.css({
            [context.dimension]: context.direction !== 'show' ? maxSize : '0px'
        })

        element.removeClass("collapse collapsing show")
        reflow(element)

        element.addClass("collapsing")
    }

    if (!context.maxSize) throw new Error("[ngb-transition]: context.maxSize was undefined");

    element.css({
        [context.dimension]: context.direction === 'show' ? context.maxSize : '0px'
    })

    return () => {
        setInitialClasses()
        element.removeClass("collapsing")
        element.css({ dimension: "" })
    }
}
