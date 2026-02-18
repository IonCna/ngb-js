import type { IController, IDirective } from "angular";
import type { NgbDropdownMenu } from "./ngb-dropdown-menu.directive"

export class NgbDropdownButtonItem implements IController {
    private ngbDisabled!: boolean
    private tabIndex!: number
    private ngbDropdownMenu!: NgbDropdownMenu

    constructor(
        private $element: JQLite
    ) { }

    $onInit(): void {
        this.ngbDisabled = this.ngbDisabled ?? false
        this.tabIndex = this.tabIndex ?? 0
    }

    $postLink(): void {
        this.$element.addClass("dropdown-item")
        this.ngbDisabled && this.$element.addClass("disabled")
        this.$element.attr("tabindex", this.tabIndex)
        this.ngbDisabled && this.$element.attr("disabled")

        if(this.ngbDisabled) {
            const [nativeElement] = Array.from(this.$element);
            (nativeElement as HTMLButtonElement).disabled = true
        }

        this.ngbDropdownMenu.register({
            $element: this.$element,
            $disabled: this.ngbDisabled,
            $tabIndex: this.tabIndex
        })
    }

    //#region $angular
    static get $name() {
        return "ngbDropdownButtonItem"
    }

    static get $factory(): () => IDirective {
        return () => ({
            bindToController: {
                ngbDisabled: "<?",
                tabIndex: "<?"
            },
            require: {
                ngbDropdownMenu: "^ngbDropdownMenu"
            },
            controller: this,
            scope: true,
            restrict: "A"
        })
    }

    static get $inject() {
        return ['$element']
    }
    //#endregion
}
