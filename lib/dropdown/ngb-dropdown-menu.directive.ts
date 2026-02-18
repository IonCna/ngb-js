import type {
    IAugmentedJQuery,
    IController,
    IDirective,
    IDocumentService,
    IPromise,
    IScope,
    ITranscludeFunction
} from "angular"
import { NgbDropdownConfig } from "./ngb-dropdown-config.service"
import { autoUpdate, computePosition, type ComputePositionConfig } from "@floating-ui/dom"
import type { DropdownConfigSave, PopperDataBinding } from "./ngb-dropdown.module"
import angular from "angular"
import type { NgbDropdown } from "./ngb-dropdown.directive"
import { NgbAnimationFactory } from "@/ngb-animation.factory"
import {
    NgbDropdownClosedEvent,
    NgbDropdownToggleEvent
} from "./ngb-dropdown.events"

type DropdownMenuRegistry = {
    $element: JQLite
    $disabled: boolean
    $tabIndex: number
}

enum ActionsKeys {
    ESCAPE = "Escape",
    UP = "ArrowUp",
    DOWN = "ArrowDown",
    HOME = "Home",
    END = "End"
}

enum CloseReason {
    DESTROY = -1,
    ESC = 0,
    CLICK = 1,
    UNKNOWN = 2
}

export class NgbDropdownMenu implements IController {
    private ngbDropdown!: NgbDropdown
    private $parent!: JQLite
    private updatePosition?: () => void
    private items: DropdownMenuRegistry[] = []
    private focusIndex = -1
    private registry!: PopperDataBinding
    private relative?: JQLite
    private anchor?: JQLite
    private handleEsc?: (event: JQueryEventObject) => void
    private handleOutside?: (event: JQueryEventObject) => void
    private handleInside?: (event: JQueryEventObject) => void
    private handleKeys?: (event: JQueryEventObject) => void
    private animationId = 0
    private opened = false
    private ngbRunTransition?: ($element: IAugmentedJQuery, startFn: () => void) => IPromise<void>

    private toggleListener?: () => void

    constructor(
        private $element: JQLite,
        private $scope: IScope,
        private ngbDropdownConfig: NgbDropdownConfig,
        private $document: IDocumentService,
        private $config: DropdownConfigSave,
        private $transclude: ITranscludeFunction,
        private ngbAnimationFactory: NgbAnimationFactory
    ) { }

    $postLink(): void {
        this.$element.addClass("dropdown-menu")
        this.$element.attr("tabindex", "-1")
        this.ngbRunTransition = this.ngbAnimationFactory.$create()

        this.toggleListener = this.$scope.$on(NgbDropdownToggleEvent, (event, state: boolean) => {
            event.stopPropagation?.()
            state ? this.open() : this.close(CloseReason.UNKNOWN)
        })

        this.registry = this.$config.get(this.ngbDropdown)!

        const { defaultOpen, dropdownClass, container } = this.registry
        this.$parent = this.$element.parent()

        if (container != 'body') {
            this.$transclude((clone) => {
                this.$element?.append(clone!)
            }, this.$element)
        }

        if (container == "body") {
            this.$transclude((clone) => {
                this.$element?.append(clone!)
            }, this.$element)

            this.relative = this.attach()
            this.anchor = this.$element.parent()
        }

        defaultOpen && this.open()

        const parent = this.$element.parent()
        dropdownClass && parent.addClass(dropdownClass)
    }

    $onDestroy(): void {
        this.toggleListener?.()
        this.close(CloseReason.DESTROY)
    }

    public register(params: DropdownMenuRegistry) {
        this.items.push(params)
    }

    private attach() {
        const container = angular.element("<div></div>")
        container.addClass("dropdown")

        return container
    }

    private clearHandlers() {
        if (this.handleEsc) this.$document.off("keydown", this.handleEsc)
        if (this.handleOutside) this.$document.off("click", this.handleOutside)
        if (this.handleInside) this.$element.off("click", this.handleInside)
        if (this.handleKeys) this.$element.off("keydown", this.handleKeys)

        this.handleEsc = undefined
        this.handleOutside = undefined
        this.handleInside = undefined
        this.handleKeys = undefined
    }

    private focusToggle() {
        const [toggle] = Array.from(this.$parent.find(".dropdown-toggle"))
        if (toggle instanceof HTMLElement) {
            toggle.focus()
        }
    }

    private close(reason: CloseReason) {
        this.$scope.$evalAsync(() => {
            void this.performClose(reason)
        })
    }

    private async performClose(reason: CloseReason) {
        if (!this.opened && reason !== CloseReason.DESTROY) return
        this.opened = false

        const id = ++this.animationId
        this.clearHandlers()

        this.updatePosition?.()
        this.updatePosition = undefined
        this.focusIndex = -1

        if (reason === CloseReason.ESC) {
            this.focusToggle()
        }

        if (this.registry.animation) {
            this.$element.css("display", "block")
            await this.ngbRunTransition?.(this.$element as IAugmentedJQuery, () => {
                this.$element.removeClass("show")
            })
        } else {
            this.$element.removeClass("show")
        }

        if (id !== this.animationId) return

        this.$element.attr("style", "")

        const { container } = this.registry
        if (container == 'body') {
            this.anchor?.append(this.$element)
            this.relative?.remove()
        }

        this.$scope.$emit(NgbDropdownClosedEvent, reason)
    }

    private open() {
        this.$scope.$evalAsync(() => {
            void this.performOpen()
        })
    }

    private enabledItems() {
        return this.items
            .filter(item => !item.$disabled)
            .map(item => {
                const [el] = Array.from(item.$element)
                return el
            })
            .filter((item): item is HTMLElement => item instanceof HTMLElement)
    }

    private async performOpen() {
        if (this.opened) return
        this.opened = true

        const id = ++this.animationId
        const { container } = this.registry

        if (container == 'body' && this.relative) {
            angular.element(document.body).append(this.relative)
            this.relative.append(this.$element)
        }

        if (this.registry.animation) {
            this.$element.css("display", "block")
            await this.ngbRunTransition?.(this.$element as IAugmentedJQuery, () => {
                this.$element.addClass("show")
            })
        } else {
            this.$element.addClass("show")
        }

        if (id !== this.animationId) return

        this.$element.css("display", "")

        const el = this.relative ? this.relative : this.$element
        const [nativeElement] = Array.from(el)
        const [parentNativeElement] = Array.from(this.$parent)

        const config: Partial<ComputePositionConfig> = {
            ...this.ngbDropdownConfig.popperOptions(),
            ...this.registry.popperOptions?.(),
            placement: this.registry.placement
        }

        if (this.relative) {
            this.$element.css("position", "static")
        }

        const position = () => computePosition(
            parentNativeElement,
            nativeElement,
            config
        ).then(position => {
            el.css({
                top: `${position.y}px`,
                left: `${position.x}px`,
                position: position.strategy
            })
        })

        this.updatePosition = autoUpdate(parentNativeElement, nativeElement, position)
        position()

        this.handleEsc = (event: JQueryEventObject) => {
            if (event.key != ActionsKeys.ESCAPE) return
            event.preventDefault()
            this.close(CloseReason.ESC)
        }

        this.handleOutside = (event: JQueryEventObject) => {
            const isInEl = nativeElement.contains(event.target)
            const isInParent = parentNativeElement.contains(event.target)

            if (isInEl || isInParent) return

            this.close(CloseReason.CLICK)
        }

        this.handleInside = (event: JQueryEventObject) => {
            let founded = false
            for (const item of this.items) {
                if (item.$disabled) continue
                const [nativeEl] = Array.from(item.$element)
                const isInside = nativeEl.contains(event.target)

                if (!isInside) continue
                founded = true

                break
            }

            if (!founded) return

            this.close(CloseReason.CLICK)
        }

        const detectOutside = angular.isString(this.registry.autoClose) && this.registry.autoClose == "outside"
        const detectInside = angular.isString(this.registry.autoClose) && this.registry.autoClose == "inside"
        const closeOnEscape = this.registry.autoClose !== false

        if (closeOnEscape) {
            this.$document.on("keydown", this.handleEsc)
        }

        if (detectOutside || this.registry.autoClose === true) {
            this.$document.on("click", this.handleOutside)
        }

        if (detectInside || this.registry.autoClose === true) {
            this.$element.on("click", this.handleInside)
        }

        nativeElement.focus()

        this.handleKeys = (event: JQueryEventObject) => {
            if (event.key != ActionsKeys.DOWN && event.key != ActionsKeys.UP && event.key != ActionsKeys.HOME && event.key != ActionsKeys.END) return
            event.preventDefault()

            const enabled = this.enabledItems()

            if (event.key == ActionsKeys.DOWN) {
                if (enabled.length === 0) return
                this.focusIndex = Math.min(this.focusIndex + 1, enabled.length - 1)
                const target = enabled[this.focusIndex]

                if (!target) {
                    this.focusIndex = -1
                    return
                }

                target.focus()
                return
            }

            if (event.key == ActionsKeys.UP) {
                if (enabled.length === 0) return
                this.focusIndex = this.focusIndex <= 0 ? 0 : this.focusIndex - 1
                const target = enabled[this.focusIndex]

                if (!target) {
                    this.focusIndex = -1
                    return
                }

                target.focus()
                return
            }

            if (event.key == ActionsKeys.HOME) {
                this.focusIndex = 0
                const target = enabled[0]

                if (!target) {
                    this.focusIndex = -1
                    return
                }

                target.focus()
                return
            }

            if (event.key == ActionsKeys.END) {
                this.focusIndex = enabled.length - 1
                const target = enabled[this.focusIndex]

                if (!target) {
                    this.focusIndex = -1
                    return
                }

                target.focus()
                return
            }
        }

        this.$element.on("keydown", this.handleKeys)
    }

    //#region $angular
    static get $name() {
        return "ngbDropdownMenu"
    }

    static get $factory(): () => IDirective {
        return () => ({
            bindToController: true,
            controller: this,
            require: {
                ngbDropdown: "^ngbDropdown"
            },
            scope: true,
            restrict: "A",
            transclude: true,
        })
    }

    static get $inject() {
        return ['$element', '$scope', NgbDropdownConfig.$name, "$document", '$dropdownConfigSave', '$transclude', NgbAnimationFactory.$name]
    }
    //#endregion
}
