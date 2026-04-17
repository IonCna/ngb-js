import type { IController, IDirective, IScope } from "angular"
import type { NgbDropdown } from "./ngb-dropdown.directive"
import { toNativeElement } from "@/utils"
import type { NgbDropdownItem } from "@/dropdown/ngb-dropdown-item.directive"

const ALLOWED_KEYS = new Set([
    "ArrowUp",
    "ArrowDown",
    "Home",
    "End",
    "Enter",
    " ",
    "Tab",
])

export class NgbDropdownMenu implements IController {
    public ngbDropdown!: NgbDropdown
    public nativeElement!: HTMLElement

    public menuItems: NgbDropdownItem[] = []
    private keydownListener?: (event: JQueryEventObject) => void
    private unwatchOpenState?: () => void

    constructor(
        public $element: JQLite,
        private $scope: IScope
    ) { }

    $postLink(): void {
        this.ngbDropdown.registerMenu(this)
        this.$element.addClass("dropdown-menu")
        this.nativeElement = toNativeElement(this.$element)

        this.unwatchOpenState = this.$scope.$watch(
            () => this.ngbDropdown.isOpen(),
            (isOpen) => this.$element.toggleClass("show", isOpen)
        )

        this.keydownListener = (event) => {
            if (!ALLOWED_KEYS.has(event.key)) return;

            this.ngbDropdown.onKeyDown(event)
        }

        this.$element.on("keydown", this.keydownListener)
    }

    $onDestroy(): void {
        if (this.keydownListener) this.$element.off("keydown", this.keydownListener)
        this.unwatchOpenState?.()
    }

    public register(item: NgbDropdownItem) {
        this.menuItems.push(item)
    }

    public unregister(item: NgbDropdownItem) {
        this.menuItems = this.menuItems.filter(menuItem => menuItem !== item)
    }

    //#region $angular
    static get $name() {
        return "ngbDropdownMenu"
    }

    static get $factory(): () => IDirective {
        return () => ({
            bindToController: true,
            controller: NgbDropdownMenu,
            require: {
                ngbDropdown: "^ngbDropdown"
            },
            scope: true,
            restrict: "A",
        })
    }

    static get $inject() {
        return ['$element', '$scope']
    }
    //#endregion
}
