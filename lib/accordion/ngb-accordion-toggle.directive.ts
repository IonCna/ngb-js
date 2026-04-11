import type { IAugmentedJQuery, IController, IDirective, IScope } from "angular";
import type { NgbAccordionItem } from "@/accordion/ngb-accordion-item.directive"
import type { NgbAccordion } from "@/accordion/ngb-accordion.directive";

export class NgbAccordionToggle implements IController {
    private item!: NgbAccordionItem
    private accordion!: NgbAccordion

    constructor(
        private $element: IAugmentedJQuery,
        private $scope: IScope
    ) {}

    $postLink(): void {
        this.$element.attr("id", this.item.toggleId)
        this.$element.attr("aria-controls", this.item.collapseId)

        const watchers = [
            () => this.item.collapsed,
            () => this.item.collapseId,
            () => this.item.disabled
        ]

        this.$scope.$watchGroup(watchers, value => {
            console.log(value)
        })
    }

    $onDestroy(): void {
    }

    static get $name() {
        return "ngbAccordionToggle"
    }

    static get $factory(): () => IDirective {
        return () => ({
            bindToController: true,
            controller: NgbAccordionToggle,
            controllerAs: "$",
            require: {
                item: "^^ngbAccordionItem",
                accordion: "^^ngbAccordionDirective"
            },
            scope: true,
            restrict: "A"
        })
    }

    static get $inject() {
        return ["$element", "$scope"]
    }
}
