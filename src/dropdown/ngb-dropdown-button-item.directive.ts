import type { IController, IDirective, IScope } from "angular";
import type { NgbDropdownItem } from "@ngb/dropdown/ngb-dropdown-item.directive";

export class NgbDropdownButtonItem implements IController {
    public item!: NgbDropdownItem
    private unwatchDisabled?: () => void

    constructor(
        private $element: JQLite,
        private $scope: IScope
    ) { }

    $onChanges(): void {
        this._applyHostBindings()
    }

    $postLink(): void {
        this.unwatchDisabled = this.$scope.$watch(
            () => this.item.disabled,
            () => this._applyHostBindings()
        )
        this._applyHostBindings()
    }

    $onDestroy(): void {
        this.unwatchDisabled?.()
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
        return ['$element', '$scope']
    }
}
