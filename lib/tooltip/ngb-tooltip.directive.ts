import angular from "angular"
import type { ICompileService, IController, IDirectiveFactory, IPromise, IScope, ITimeoutService } from "angular"
import { NgbTooltipConfig } from "./ngb-tooltip-config.service"
import type { NgbToolTipWindowScope } from "./ngb-tooltip.module"
import type { Placement } from "@floating-ui/dom"
import { NgbAnimationFactory } from "@/ngb-animation.factory"
import type { IAugmentedJQuery } from "angular"
import { NgbTooltipPositionEvent } from "./ngb-tooltip.events"

class NgbTooltipController implements IController {
    private wrapper!: JQLite
    private wrapperScope!: NgbToolTipWindowScope
    private opened = false

    private closeTimer?: IPromise<void>
    private openTimer?: IPromise<void>

    private parent!: JQLite

    private animation?: boolean
    private autoClose?: boolean
    private closeDelay?: number
    private container?: string | HTMLElement | JQLite
    private disableTooltip?: boolean
    private ngbTooltip!: JQLite
    private openDelay?: number
    private placement?: string
    private popperOptions?: unknown
    private positionTarget?: JQLite
    private tooltipClass?: string
    private tooltipContext?: any
    private triggers?: string

    private showHandler!: () => void
    private hideHandler!: () => void
    private toggleHandler!: () => void
    private triggerOffs: Array<() => void> = []

    private hidden?: () => void
    private shown?: () => void

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
        this.openDelay = this.openDelay ?? this.$toolTipConfig.openDelay
        this.placement = this.placement ?? this.$toolTipConfig.placement
        this.tooltipClass = this.tooltipClass ?? this.$toolTipConfig.tooltipClass
        this.triggers = this.triggers ?? this.$toolTipConfig.triggers
        this.container = this.container ?? this.$toolTipConfig.container
        this.ngbRunTransition = this.ngbAnimationFactory.$create()
        this.disableTooltip = this.disableTooltip ?? this.$toolTipConfig.disableTooltip
        void this.autoClose
        void this.popperOptions
        void this.tooltipContext

        this.parent = this.resolveContainer()

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

        this.showHandler = () => this.$scope.$evalAsync(() => this.onEnter())
        this.hideHandler = () => this.$scope.$evalAsync(() => this.onLeave())
        this.toggleHandler = () => this.$scope.$evalAsync(() => this.toggle())
    }

    $onDestroy(): void {
        this.triggerOffs.forEach(off => off())
        this.triggerOffs = []

        this.closeTimer && this.$timeout.cancel(this.closeTimer)
        this.openTimer && this.$timeout.cancel(this.openTimer)

        this.wrapperScope.$destroy()
        this.wrapper.remove()
    }

    $postLink(): void {
        this.bindTriggers()
    }

    private onEnter() {
        if (this.disableTooltip || !this.ngbTooltip || this.opened) return

        if (this.closeTimer) {
            this.$timeout.cancel(this.closeTimer)
            this.closeTimer = undefined
        }

        const delay = this.openDelay ?? 0
        this.openTimer = this.$timeout(() => {
            if (this.opened || this.disableTooltip) return

            this.opened = true
            this.parent.append(this.wrapper)
            this.wrapperScope.$broadcast(NgbTooltipPositionEvent)

            if (!this.animation) {
                this.wrapper.addClass("show")
                this.shown?.()
                return
            }

            this.ngbRunTransition?.(this.wrapper as IAugmentedJQuery, () => this.wrapper.addClass("show"))
                ?.finally(() => this.shown?.())
        }, delay)
    }

    private onLeave() {
        if (!this.opened && !this.openTimer) return

        this.opened = false

        if (this.openTimer) {
            this.$timeout.cancel(this.openTimer)
            this.openTimer = undefined
        }

        if (this.closeTimer) {
            this.$timeout.cancel(this.closeTimer)
            this.closeTimer = undefined
        }

        this.closeTimer = this.$timeout(() => {
            if (!this.animation) {
                this.wrapper.removeClass("show")
                this.wrapper.remove()
                this.closeTimer = undefined
                this.hidden?.()
                return
            }

            this.ngbRunTransition?.(this.wrapper as IAugmentedJQuery, () => {
                this.wrapper.removeClass("show")
            }).finally(() => {
                this.wrapper.remove()
                this.closeTimer = undefined
                this.hidden?.()
            })
        }, this.closeDelay)
    }

    public open() {
        this.onEnter()
    }

    public close() {
        this.onLeave()
    }

    public toggle() {
        if (this.opened) {
            this.onLeave()
            return
        }
        this.onEnter()
    }

    public isOpen() {
        return this.opened
    }

    private bindTriggers() {
        const parsed = this.parseTriggers(this.triggers ?? this.$toolTipConfig.triggers)
        if (parsed.length === 0) return

        parsed.forEach(([openEvent, closeEvent]) => {
            if (openEvent === "manual") return
            if (openEvent === "click") {
                this.$element.on("click", this.toggleHandler)
                this.triggerOffs.push(() => this.$element.off("click", this.toggleHandler))
                return
            }

            this.$element.on(openEvent, this.showHandler)
            this.triggerOffs.push(() => this.$element.off(openEvent, this.showHandler))

            if (!closeEvent) return
            this.$element.on(closeEvent, this.hideHandler)
            this.triggerOffs.push(() => this.$element.off(closeEvent, this.hideHandler))
        })
    }

    private parseTriggers(raw: string) {
        return raw
            .split(/\s+/)
            .map(item => item.trim())
            .filter(Boolean)
            .map(trigger => {
                if (trigger.includes(":")) {
                    const [open, close] = trigger.split(":")
                    return [open, close] as const
                }

                if (trigger === "hover") return ["mouseenter", "mouseleave"] as const
                if (trigger === "focus") return ["focus", "blur"] as const
                if (trigger === "click") return ["click", "click"] as const
                if (trigger === "manual") return ["manual", ""] as const

                return [trigger, ""] as const
            })
    }

    private resolveContainer() {
        if (!this.container) return this.$element.parent()

        if (angular.isString(this.container)) {
            const target = (this.container as string).trim()
            if (target === "body") {
                return angular.element(document.body)
            }

            const searched = document.querySelector(target)
            return angular.element(searched ?? this.$element.parent())
        }

        return angular.element(this.container)
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
