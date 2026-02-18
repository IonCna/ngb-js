import type { IController, IDirective, IDocumentService, IScope, ITranscludeFunction } from "angular"
import { NgbDropdownConfig } from "./ngb-dropdown-config.service"
import { autoUpdate, computePosition, type ComputePositionConfig } from "@floating-ui/dom"
import type { DropdownConfigSave, PopperDataBinding } from "./ngb-dropdown.module"
import angular from "angular"
import type { NgbDropdown } from "./ngb-dropdown.directive"
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
    private focusIndex = 0
    private registry!: PopperDataBinding
    private relative?: JQLite
    private anchor?: JQLite
    private handleEsc?: (event: JQueryEventObject) => void
    private handleOutside?: (event: JQueryEventObject) => void
    private handleInside?: (event: JQueryEventObject) => void
    private handleKeys?: (event: JQueryEventObject) => void

    private toggleListener?: () => void

    constructor(
        private $element: JQLite,
        private $scope: IScope,
        private ngbDropdownConfig: NgbDropdownConfig,
        private $document: IDocumentService,
        private $config: DropdownConfigSave,
        private $transclude: ITranscludeFunction
    ) { }

    $postLink(): void {
        this.$element.addClass("dropdown-menu")

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
        this.toggleListener?.();
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

    private close(reason: CloseReason) {
        this.$scope.$evalAsync(() => {
            this.$element.removeClass("show")
            this.$element.attr("style", "")
            this.handleEsc && this.$document.off("keydown", this.handleEsc)
            this.handleOutside && this.$document.off("click", this.handleOutside)
            this.handleInside && this.$element.off("click", this.handleInside)
            this.handleKeys && this.$element.off("keydown", this.handleKeys)
            this.updatePosition?.()
            this.focusIndex = 0

            const { container } = this.registry
            if (container == 'body') {
                this.anchor?.append(this.$element)
                this.relative?.remove()
            }

            this.handleEsc = undefined
            this.handleOutside = undefined
            this.handleInside = undefined
            this.handleKeys = undefined

            this.$scope.$emit(NgbDropdownClosedEvent, reason)
        })
    }

    private open() {
        const { container } = this.registry

        if (container == 'body' && this.relative) {
            angular.element(document.body).append(this.relative)
            this.relative.append(this.$element)
        }

        this.$element.addClass("show")

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

        if (detectOutside || this.registry.autoClose === true) {
            this.$document.on("keydown", this.handleEsc)
            this.$document.on("click", this.handleOutside)
        }

        if (detectInside || this.registry.autoClose === true) {
            this.$element.on("click", this.handleInside)
        }

        nativeElement.focus()

        const notDisabled = this.items.filter(item => !item.$disabled).map(item => {
            const [el] = Array.from(item.$element)
            return el
        })

        this.handleKeys = (event: JQueryEventObject) => {
            if (event.key != ActionsKeys.DOWN && event.key != ActionsKeys.UP && event.key != ActionsKeys.HOME && event.key != ActionsKeys.END) return;

            if (event.key == ActionsKeys.DOWN) {
                const isOverflowed = this.focusIndex >= notDisabled.length - 1
                this.focusIndex = isOverflowed ? this.focusIndex = notDisabled.length - 1 : this.focusIndex + 1
                const target = notDisabled[this.focusIndex];

                if (!target) {
                    this.focusIndex = 0
                    return
                }

                target.focus()
                return
            }

            if (event.key == ActionsKeys.UP) {
                const isOverflowed = this.focusIndex <= 0
                this.focusIndex = isOverflowed ? this.focusIndex = 0 : this.focusIndex - 1
                const target = notDisabled[this.focusIndex];

                if (!target) {
                    this.focusIndex = 0
                    return
                }

                target.focus()
                return
            }

            if (event.key == ActionsKeys.HOME) {
                const target = notDisabled[0]

                if (!target) {
                    this.focusIndex = 0
                    return
                }

                target.focus()
                return
            }

            if (event.key == ActionsKeys.END) {
                const target = notDisabled[notDisabled.length - 1]

                if (!target) {
                    this.focusIndex = 0
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
        return ['$element', '$scope', NgbDropdownConfig.$name, "$document", '$dropdownConfigSave', '$transclude']
    }
    //#endregion
}
