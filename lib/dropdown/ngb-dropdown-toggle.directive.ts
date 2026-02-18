import type { IController, IDirective, IScope } from "angular"
import type { NgbDropdown } from "./ngb-dropdown.directive"
import type { DropdownConfigSave } from "./ngb-dropdown.module"
import { NgbDropdownCloseEvent, NgbDropdownToggleEvent } from "./ngb-dropdown.events"

export class NgbDropdownToggle implements IController {
    private ngbDropdown!: NgbDropdown

    private toggleListener?: () => void
    private closeListener?: () => void
    private clickListener?: (event: JQueryEventObject) => void

    constructor(
        private $element: JQLite,
        private $scope: IScope,
        private $config: DropdownConfigSave
    ) { }

    $onInit(): void {
        this.toggleListener = this.$scope.$on(NgbDropdownToggleEvent, (_event, state: boolean) => {
            this.$element.toggleClass("show", state)
        })

        this.closeListener = this.$scope.$on(NgbDropdownCloseEvent, event => {
            this.$element.removeClass("show")
            event.stopPropagation?.()
        })
    }

    $postLink(): void {
        const registry = this.$config.get(this.ngbDropdown)!
        const { defaultOpen } = registry

        defaultOpen && this.$element.addClass("show")

        this.$element.addClass("dropdown-toggle")

        this.clickListener = () => this.$scope.$evalAsync(() => {
            this.ngbDropdown.toggle()
        })

        this.$element.on("click", this.clickListener)
    }

    $onDestroy(): void {
        if (this.clickListener) this.$element.off("click", this.clickListener)
        this.toggleListener?.()
        this.closeListener?.()
    }

    //#region $angular
    static get $name() {
        return "ngbDropdownToggle"
    }

    static get $factory(): () => IDirective {
        return () => ({
            bindToController: true,
            scope: true,
            require: {
                ngbDropdown: "^ngbDropdown"
            },
            controller: this,
            restrict: "A"
        })
    }

    static get $inject() {
        return ['$element', '$scope', '$dropdownConfigSave']
    }
    //#endregion
}
