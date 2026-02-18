import type { IController, IDirective, IScope } from "angular"
import { NgbDropdownConfig } from "./ngb-dropdown-config.service"
import type { ComputePositionConfig, Placement } from "@floating-ui/dom"
import type { DropdownConfigSave } from "./ngb-dropdown.module"
import angular from "angular"
import {
    NgbDropdownCloseEvent,
    NgbDropdownClosedEvent,
    NgbDropdownToggleEvent
} from "./ngb-dropdown.events"

export class NgbDropdown implements IController {
    private autoClose!: boolean
    private container!: "body" | null
    private display?: 'dynamic' | 'static'
    private dropdownClass?: string
    private isOpened!: boolean
    private popperOptions?: (opts?: Partial<ComputePositionConfig>) => Partial<ComputePositionConfig>
    private openChange?: (locals: { state: boolean }) => void
    private placement?: Placement

    private toggleListener?: () => void

    constructor(
        private $ngbDropdownConfig: NgbDropdownConfig,
        private $element: JQLite,
        private $scope: IScope,
        private $config: DropdownConfigSave
    ) { }

    $onInit(): void {
        this.autoClose = this.autoClose ?? this.$ngbDropdownConfig.autoClose
        this.container = this.container ?? this.$ngbDropdownConfig.container

        if (angular.isString(this.container) && this.container != "body") {
            throw new Error("ngbDropdown only supports 'body' as container")
        }

        if(this.display) {
            throw new Error("dropdown display is not supported")
        }

        this.isOpened = this.isOpened ?? false

        this.$config.set(this, {
            container: this.container,
            dropdownClass: this.dropdownClass,
            defaultOpen: this.isOpened,
            placement: this.placement ?? "bottom",
            popperOptions: this.popperOptions,
            autoClose: this.autoClose
        })
    }

    $postLink(): void {
        this.$element.addClass("dropdown")

        this.$scope.$on(NgbDropdownClosedEvent, () => {
            this.isOpened = false
            this.openChange?.({ state: this.isOpened })
            this.$scope.$broadcast(NgbDropdownCloseEvent)
        })
    }

    $onDestroy(): void {
        this.toggleListener?.()
        this.$config.delete(this)
    }

    public isOpen = () => this.isOpened

    public open = () => {
        this.isOpened = true
        this.openChange?.({ state: this.isOpened })
        this.$scope.$broadcast(NgbDropdownToggleEvent, this.isOpened)
    }

    public close = () => {
        this.isOpened = false
        this.openChange?.({ state: this.isOpened })
        this.$scope.$broadcast(NgbDropdownToggleEvent, this.isOpened)
    }

    public toggle() {
        if (!this.isOpened) {
            this.open()
            return
        }

        this.close()
    }

    //#region $angular

    static get $name() {
        return "ngbDropdown"
    }

    static get $factory(): () => IDirective {
        return () => ({
            restrict: "A",
            scope: true,
            bindToController: {
                autoClose: "<?",
                container: "<?",
                display: "<?",
                dropdownClass: "<?",
                isOpened: "<?open",
                popperOptions: "<?",
                openChange: "&?",
                placement: "<?"
            },
            controller: this,
        })
    }

    static get $inject() {
        return [NgbDropdownConfig.$name, '$element', '$scope', '$dropdownConfigSave']
    }

    //#endregion
}
