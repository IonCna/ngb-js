import type { IComponentController, IDirective, IScope } from "angular";
import { NgbNavItem } from "./ngb-nav-item.directive"

let counter = 0

export class NgbNavLink implements IComponentController {
    private ngbNavItem!: NgbNavItem
    private id!: string

    constructor(
        private $element: JQLite,
        private $scope: IScope
    ) {}

    $postLink(): void {
        this.$element.addClass("nav-link")
        this.$element.attr("type", "button")

        this.id = `ngb-nav-${counter++}`

        this.$element.on("click", () => this.$scope.$evalAsync(() => {
            this.ngbNavItem.emit()
            this.toggleActive(true)
        }))
    }

    $onDestroy(): void {
        this.$element.off("click")
    }

    public register() {
        return { toggle: this.toggleActive.bind(this) }
    }

    private toggleActive(active: boolean) {
        const ariaSelected = active ? "true" : "false"
        const ariaControls = `${this.id}-panel`

        this.$element.toggleClass("active", active)
        this.$element.attr("aria-selected", ariaSelected)
        this.$element.attr("aria-controls", ariaControls)

        this.$element.attr("aria-disabled", "false")
    }

    //#region $angular

    static get $inject() {
        return ['$element', '$scope']
    }

    static get $name() {
        return "ngbNavLink"
    }

    static get $factory(): () => IDirective {
        return () => ({
            controller: this,
            require: {
                ngbNavItem: `^${NgbNavItem.$name}`
            },
            bindToController: true,
            scope: {
                "ngbNavOutlet": "<?",
                "paneRole": "<?"
            }
        })
    }

    //#endregion
}
