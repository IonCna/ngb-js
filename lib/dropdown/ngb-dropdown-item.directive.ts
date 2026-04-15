import { toNativeElement } from "@/utils";
import type { IController, IDirective } from "angular";
import type { NgbDropdownMenu } from "@/dropdown/ngb-dropdown-menu.directive";

export class NgbDropdownItem implements IController {
    static ngAcceptInputType_disabled: boolean | ''
    private _disabled = false

    public nativeElement!: HTMLElement
    public ngbDropdownMenu!: NgbDropdownMenu
    public tabindex: string | number = 0

    constructor(
        public $element: JQLite
    ) { }

    set disabled(value: boolean) {
        this._disabled = <any>value === '' || value === true
    }

    get disabled() {
        return this._disabled
    }

    $postLink(): void {
        this.nativeElement = toNativeElement(this.$element)

        this.$element.addClass("dropdown-item")
        this.ngbDropdownMenu.register(this)
        this._applyHostBindings()
    }

    $onChanges(): void {
        this._applyHostBindings()
    }

    $onDestroy(): void {
        this.ngbDropdownMenu.unregister(this)
    }

    private _applyHostBindings() {
        this.$element.toggleClass("disabled", this.disabled)
        this.$element.attr("tabIndex", this.disabled ? -1 : this.tabindex)
    }

    //#region $angular
    static get $name() {
        return "ngbDropdownItem"
    }

    static get $factory(): () => IDirective {
        return () => ({
            bindToController: {
                disabled: "<?",
                tabindex: "<?"
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
