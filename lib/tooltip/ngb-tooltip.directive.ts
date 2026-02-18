import type { ICompileService, IController, IDirectiveFactory, IPromise, IScope, ITimeoutService } from "angular"
import { NgbTooltipConfig } from "./ngb-tooltip-config.service"
import type { NgbToolTipWindowScope } from "./ngb-tooltip.module"
import type { Placement } from "@floating-ui/dom"
import { NgbAnimationFactory } from "@/ngb-animation.factory"
import type { IAugmentedJQuery } from "angular"

class NgbTooltipController implements IController {
    private wrapper!: JQLite
    private wrapperScope!: NgbToolTipWindowScope
    private opened = false

    private isClosing?: IPromise<void>
    private isOpening?: IPromise<void>

    private parent!: JQLite

    private animation?: boolean
    private autoClose?: boolean
    private closeDelay?: number
    private container?: JQLite
    private disableTooltip?: boolean
    private ngbTooltip!: JQLite
    private openDelay?: number
    private placement?: string
    private popperOptions?: unknown
    private positionTarget?: JQLite
    private tooltipClass?: string
    private tooltipContext?: any
    private triggers?: string

    private mouseEnterHandler!: () => void
    private mouseLeaveHandler!: () => void
    private ngbRunTransition?: ($element: IAugmentedJQuery, startFn: () => void) => IPromise<void>

    constructor(
        private $element: JQLite,
        private $compile: ICompileService,
        private $scope: IScope,
        private $timeout: ITimeoutService,
        private $toolTipConfig: NgbTooltipConfig,
        private ngbAnimationFactory: NgbAnimationFactory
    ) { }

    $onInit(): void {
        this.animation = this.animation ?? this.$toolTipConfig.animation
        this.autoClose = this.autoClose ?? this.$toolTipConfig.autoClose
        this.closeDelay = this.closeDelay ?? this.$toolTipConfig.closeDelay
        this.ngbRunTransition = this.ngbAnimationFactory.$create()
        void this.disableTooltip
        void this.openDelay
        void this.popperOptions
        void this.tooltipContext

        this.parent = this.$element.parent()

        this.wrapperScope = this.$scope.$new(true) as NgbToolTipWindowScope
        this.wrapperScope.innerHtml = this.ngbTooltip

        this.wrapperScope.options = {
            animation: this.animation,
            container: this.container,
            placement: this.placement as Placement,
            positionTarget: this.positionTarget,
            tooltipClass: this.tooltipClass,
            triggers: this.triggers
        }

        this.wrapperScope.referenceEl = this.$element

        const linkFn = this.$compile(`<ngb-tooltip-window reference-el="referenceEl" options="options" inner-html="innerHtml" ></ngb-tooltip-window>`)
        this.wrapper = linkFn(this.wrapperScope)

        this.mouseEnterHandler = () => this.$scope.$evalAsync(() => this.onEnter())
        this.mouseLeaveHandler = () => this.$scope.$evalAsync(() => this.onLeave())
    }

    $onDestroy(): void {
        this.$element.off("mouseenter", this.mouseEnterHandler)
        this.$element.off("mouseleave", this.mouseLeaveHandler)

        this.isClosing && this.$timeout.cancel(this.isClosing)
        this.isOpening && this.$timeout.cancel(this.isOpening)

        this.wrapperScope.$destroy()
        this.wrapper.remove()
    }

    $postLink(): void {
        this.$element.on("mouseenter", this.mouseEnterHandler)
        this.$element.on("mouseleave", this.mouseLeaveHandler)
    }

    private onEnter() {
        if (this.isClosing) {
            this.$timeout.cancel(this.isClosing)
            this.isClosing = undefined
        }

        this.opened = true
        this.parent.append(this.wrapper)

        if (!this.animation) {
            this.wrapper.addClass("show")
            return
        }

        this.isOpening = this.ngbRunTransition?.(this.wrapper as IAugmentedJQuery, () => {
            this.wrapper.addClass("show")
        })
        this.isOpening?.finally(() => {
            this.isOpening = undefined
        })
    }

    private onLeave() {
        this.opened = false

        if (this.isOpening) {
            this.$timeout.cancel(this.isOpening)
            this.isOpening = undefined
        }

        this.isClosing = this.$timeout(() => {
            if (!this.animation) {
                this.wrapper.removeClass("show")
                this.wrapper.remove()
                this.isClosing = undefined
                return
            }

            this.ngbRunTransition?.(this.wrapper as IAugmentedJQuery, () => {
                this.wrapper.removeClass("show")
            }).finally(() => {
                this.wrapper.remove()
                this.isClosing = undefined
            })
        }, this.closeDelay)
    }

    public open() {
        this.opened = true
    }

    public close() {
        this.opened = false
    }

    public toggle() {
        this.opened = !this.opened
    }

    public isOpen() {
        return this.opened
    }

    static get $inject() {
        return ['$element', '$compile', '$scope', '$timeout', NgbTooltipConfig.$name, NgbAnimationFactory.$name]
    }
}

export class NgbTooltip {
    static get $name() {
        return "ngbTooltip"
    }

    static get $factory(): IDirectiveFactory {
        return () => ({
            scope: {
                animation: "<?",
                autoClose: "<?",
                closeDelay: "<?",
                container: "<?",
                disableTooltip: "<?",
                ngbTooltip: "<",
                openDelay: "<?",
                placement: "@?",
                popperOptions: "<?",
                positionTarget: "<?",
                tooltipClass: "<?",
                tooltipContext: "<?",
                triggers: "<?",
                hidden: "&?",
                shown: "&?"
            },
            bindToController: true,
            controller: NgbTooltipController,
        })
    }
}
