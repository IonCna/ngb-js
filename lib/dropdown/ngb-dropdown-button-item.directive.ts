import type { IController, IDirective } from "angular";
import type { NgbDropdownItem } from "@/dropdown/ngb-dropdown-item.directive";

export class NgbDropdownButtonItem implements IController {
    public item!: NgbDropdownItem

    constructor(
        private $element: JQLite
    ) { }

    $onChanges(): void {
        this._applyHostBindings()
    }

    $postLink(): void {
        this._applyHostBindings()
    }

    private _applyHostBindings() {
        this.$element.attr("disabled", this.item.disabled ? "disabled" : null)
    }

    static get $name() {
        return "ngbDropdownButtonItem"
    }

    static get $factory(): () => IDirective {
        return () => ({
            bindToController: true,
            controller: NgbDropdownButtonItem,
            require: {
                item: "ngbDropdownItem"
            },
            restrict: "A"
        })
    }

    static get $inject() {
        return ['$element']
    }
}
