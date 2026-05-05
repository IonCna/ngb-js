import { toNativeElement } from "@ngb/utils";
import type { IController, IDirective, ILogService } from "angular";
import type { NgbDropdownMenu } from "@ngb/dropdown/ngb-dropdown-menu.directive";
import type { NgbDropdownButtonItem } from "@ngb/dropdown/ngb-dropdown-button-item.directive";

export class NgbDropdownItem implements IController {
    static ngAcceptInputType_disabled: boolean | ''
    private _disabled = false

    public nativeElement!: HTMLElement
    public ngbDropdownMenu!: NgbDropdownMenu
    public ngbDropdownButtonItem?: NgbDropdownButtonItem
    public tabindex: string | number = 0

    constructor(
        public $element: JQLite,
        private $log: ILogService
    ) { }

    set disabled(value: boolean) {
        this._disabled = <any>value === '' || value === true
    }

    get disabled() {
        return this._disabled
    }

    $postLink(): void {
        this.nativeElement = toNativeElement(this.$element)

        if (this.nativeElement instanceof HTMLButtonElement && !this.ngbDropdownButtonItem) {
            this.$log.warn(`[ngb-dropdown]: ngbDropdownButtonItem is required when ngbDropdownItem is used on a button element.`)
        }

        this.$element.addClass("dropdown-item")
        this.ngbDropdownMenu.register(this)
        this._applyHostBindings()
    }

    $onChanges(): void {
        this._applyHostBindings()
    }

    $doCheck(): void {
        const disabled = this.$element.attr("disabled")
        const needChange = Boolean(disabled) != this._disabled

        if(!needChange) return

        this._disabled = Boolean(
            disabled
        )

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
                // TODO: add system to watch ng-disabled compatible, disabled use vanilla and do not work here
                tabindex: "<?"
            },
            require: {
                ngbDropdownMenu: "^ngbDropdownMenu",
                ngbDropdownButtonItem: "?ngbDropdownButtonItem"
            },
            controller: NgbDropdownItem,
            scope: true,
            restrict: "A"
        })
    }

    static get $inject() {
        return ['$element', '$log']
    }
    //#endregion
}
