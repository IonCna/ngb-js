import type { IComponentController, IComponentOptions, IScope } from "angular";
import angular from "angular";
import type { NgbTooltipWindowOptions } from "./ngb-tooltip.module";
import { autoUpdate, computePosition, flip, offset, shift, arrow } from "@floating-ui/dom";
import { NgbTooltipPositionEvent } from "./ngb-tooltip.events";

export class NgbTooltipWindowComponent implements IComponentController {
    private innerHtml!: JQLite
    private options!: NgbTooltipWindowOptions
    private referenceEl!: JQLite

    private cleanUpHandler!: () => void

    constructor(
        private $element: JQLite,
        private $scope: IScope
    ) { }

    $postLink(): void {
        this.$element.attr("role", "tooltip")
        this.$element.addClass("tooltip")
        this.options?.animation && this.$element.addClass("fade")

        const arrowEl = angular.element("<div></div>")

        arrowEl.addClass("tooltip-arrow")
        this.$element.append(arrowEl)

        const innerContainer = angular.element("<div></div>")
        innerContainer.addClass("tooltip-inner")

        innerContainer.append(this.innerHtml)
        this.$element.append(innerContainer)

        const floating = this.$element[0]
        const reference = this.referenceEl[0]

        const update = () => computePosition(reference, floating, {
            placement: this.options?.placement ?? "top",
            strategy: "absolute",
            middleware: [
                offset(8),
                flip({ fallbackPlacements: ['top','bottom','right','left'] }),
                shift({ padding: 8 }),
                arrow({ element: arrowEl[0], padding: 5 })
            ]
        }).then(({ x, y, middlewareData }) => {
            Object.assign(floating.style, {
                left: `${x}px`,
                top: `${y}px`,
                position: "absolute"
            })

            const arrowData = middlewareData.arrow
            if (!arrowData) return

            const side = (this.options?.placement ?? "top").split("-")[0]
            const oppositeSide = {
                top: "bottom",
                right: "left",
                bottom: "top",
                left: "right"
            }[side] as "top" | "right" | "bottom" | "left"

            Object.assign((arrowEl[0] as HTMLElement).style, {
                left: arrowData.x != null ? `${arrowData.x}px` : "",
                top: arrowData.y != null ? `${arrowData.y}px` : "",
                right: "",
                bottom: "",
                [oppositeSide]: "-4px"
            })
        })

        this.$scope.$on(NgbTooltipPositionEvent, update)
        this.$scope.$broadcast(NgbTooltipPositionEvent)
        this.cleanUpHandler = autoUpdate(reference, floating, update, { animationFrame: true })
    }

    $onDestroy(): void {
        this.cleanUpHandler && this.cleanUpHandler()
        const isText = angular.isString(this.innerHtml)
        if (isText) return

        this.innerHtml.remove()
    }

    static get $inject() {
        return ['$element', '$scope']
    }

    static get $factory(): IComponentOptions {
        return {
            controller: this,
            bindings: {
                options: "<",
                innerHtml: "<",
                referenceEl: "<"
            }
        }
    }

    static get $name() {
        return "ngbTooltipWindow"
    }
}
