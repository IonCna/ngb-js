import type { IController, IDirective } from "angular"
import type { NgbDropdown } from "./ngb-dropdown.directive"
import { toNativeElement } from "@/utils"
import type { NgbDropdownItem } from "@/dropdown/ngb-dropdown-item.directive"

const ALLOWED_KEYS = new Set([
    "ArrowUp",
    "ArrowDown",
    "Home",
    "End",
    "Enter",
    "Space",
    "Tab",
    "ShiftTab",
])

export class NgbDropdownMenu implements IController {
    public ngbDropdown!: NgbDropdown
    public nativeElement!: HTMLElement

    public menuItems: NgbDropdownItem[] = []

    constructor(
        public $element: JQLite
    ) { }

    $postLink(): void {
        this.ngbDropdown.registerMenu(this)
        this.$element.addClass("dropdown-menu")
        this.nativeElement = toNativeElement(this.$element)

        this.$element.on("keydown", (event) => {
            if (!ALLOWED_KEYS.has(event.key)) return;

            const onKeydown: Record<string, () => void> = {
                ["ArrowUp"]: () => this.ngbDropdown.onKeyDown(event),
                ["ArrowDown"]: () => this.ngbDropdown.onKeyDown(event),
                ["Home"]: () => this.ngbDropdown.onKeyDown(event),
                ["End"]: () => this.ngbDropdown.onKeyDown(event),
                ["Enter"]: () => this.ngbDropdown.onKeyDown(event),
                ["Space"]: () => this.ngbDropdown.onKeyDown(event),
                ["Tab"]: () => this.ngbDropdown.onKeyDown(event),
                ["ShiftTab"]: () => this.ngbDropdown.onKeyDown(event)
            }

            const action = onKeydown[event.key]
            action?.()
        })
    }

    $onDestroy(): void {
        this.$element.off("keydown")
    }

    public register(item: NgbDropdownItem) {
        this.menuItems.push(item)
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
        return ['$element']
    }
    //#endregion
}
