import type { IComponentController, IComponentOptions, IScope } from "angular";
import angular from "angular";
import type { NgbTooltipWindowOptions } from "./ngb-tooltip.module";
import { autoUpdate, computePosition, flip, offset, shift, arrow } from "@floating-ui/dom";
import { NgbTooltipPositionEvent } from "./ngb-tooltip.events";
import template from "@/tooltip/ngb-tooltip-window.component.html?raw"

export class NgbTooltipWindowComponent implements IComponentController {
    public innerHtml!: JQLite
    private options!: NgbTooltipWindowOptions
    private referenceEl!: JQLite

    private cleanUpHandler?: () => void
    private positionOff?: () => void

    constructor(
        private $element: JQLite,
        private $scope: IScope
    ) { }

    $postLink(): void {
        this.$element.attr("role", "tooltip")
        this.$element.addClass("tooltip")
        this.options?.animation && this.$element.addClass("fade")

        const [host] = Array.from(this.$element)
        const arrowHost = host.querySelector("[tooltip-arrow]")
        const innerHost = host.querySelector("[tooltip-inner]")
        if (!arrowHost || !innerHost) return

        const arrowEl = angular.element(arrowHost)
        const innerContainer = angular.element(innerHost)
        innerContainer.append(this.innerHtml)

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
        }).then(({ x, y, placement, middlewareData }) => {
            Object.assign(floating.style, {
                left: `${x}px`,
                top: `${y}px`,
                position: "absolute"
            })

            const arrowData = middlewareData.arrow
            if (!arrowData) return

            const side = placement.split("-")[0]
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

        this.positionOff = this.$scope.$on(NgbTooltipPositionEvent, update)
        this.$scope.$broadcast(NgbTooltipPositionEvent)
        this.cleanUpHandler = autoUpdate(reference, floating, update, { animationFrame: true })
    }

    $onDestroy(): void {
        this.positionOff?.()
        this.cleanUpHandler?.()
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
            controllerAs: "$",
            bindings: {
                options: "<",
                innerHtml: "<",
                referenceEl: "<"
            },
            template
        }
    }

    static get $name() {
        return "ngbTooltipWindow"
    }
}
