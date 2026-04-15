import type { IController, IDirective, IOnChangesObject, IScope } from "angular"
import type { NgbDropdown } from "./ngb-dropdown.directive"
import { NgbDropdownCloseEvent, NgbDropdownToggleEvent } from "./ngb-dropdown.events"

export class NgbDropdownToggle implements IController {
    private ngbDropdown!: NgbDropdown

    constructor(
        private $element: JQLite
    ) { }

    $onInit(): void {
    }

    $postLink(): void {
        this.$element.addClass("dropdown-toggle")

        this.$element.on("click", () => {
            this.ngbDropdown.toggle()
        })
    }

    $onChanges(onChangesObj: IOnChangesObject): void {
        this.$element.toggleClass("show", this.ngbDropdown.isOpen())
    }

    $onDestroy(): void {
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
            controller: NgbDropdownToggle,
            restrict: "A"
        })
    }

    static get $inject() {
        return ["$element"]
    }
    //#endregion
}
