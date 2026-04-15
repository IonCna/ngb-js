import type { IController, IDirective } from "angular";
import type { NgbDropdown } from "@/dropdown/ngb-dropdown.directive";
import { toNativeElement } from "@/utils";

export class NgbDropdownAnchor implements IController {
    private dropdown!: NgbDropdown

    constructor(
        private $element: JQLite
    ) { }

    $postLink(): void {
        this.$element.addClass("dropdown-toggle")
    }

    $onChanges(): void {
        this.$element.toggleClass("show", this.dropdown.isOpen())
        this.$element.attr("aria-expanded", `${this.dropdown.isOpen()}`)
    }

    get nativeElement() {
        return toNativeElement(this.$element)
    }

    static get $inject() {
        return ['$element']
    }

    static get $name() {
        return "ngbDropdownAnchor"
    }

    static get $factory(): () => IDirective {
        return () => ({
            controller: NgbDropdownAnchor,
            restrict: "A",
            require: {
                dropdown: "^ngbDropdown"
            },
            bindToController: true,
            scope: true
        })
    }
}
