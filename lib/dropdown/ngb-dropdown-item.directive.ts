import { toNativeElement } from "@/utils";
import type { IController, IDirective } from "angular";

export class NgbDropdownItem implements IController {
    static ngAcceptInputType_disabled: boolean | ''
    private _disabled = false
    private _isButton: boolean = false

    tabIndex: string | number = 0

    constructor(
        private $element: JQLite
    ) { }

    set disables(value: boolean) {
        this._disabled = <any>value == '' || value === true
    }

    get disabled() {
        return this._disabled
    }

    $postLink(): void {
        this._isButton = toNativeElement(this.$element) instanceof HTMLButtonElement

        if (!this._isButton) {
            this.$element.addClass("dropdown-item")
        }
    }

    $onChanges(): void {
        if (!this._isButton) {
            this.$element.toggleClass("disabled", this.disabled)
            this.$element.attr("tabIndex", this.disabled ? -1 : this.tabIndex)
        }

        if(this._isButton) {
            this.$element.attr("disabled", `${this.disabled}`)
        }
    }

    //#region $angular
    static get $name() {
        return "ngbDropdownItem"
    }

    static get $factory(): () => IDirective {
        return () => ({
            bindToController: {
                disabled: "<?",
                tabIndex: "<?"
            },
            require: {
                ngbDropdownMenu: "^ngbDropdownMenu"
            },
            controller: NgbDropdownItem,
            scope: true,
            restrict: "A"
        })
    }

    static get $inject() {
        return ['$element']
    }
    //#endregion
}