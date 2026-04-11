import type { IAugmentedJQuery, IController, IDirective, IScope } from "angular";
import type { NgbAccordionItem } from "@/accordion/ngb-accordion-item.directive"

export class NgbAccordionButton implements IController {
    private item!: NgbAccordionItem
    private disableWatcher?: () => void

    constructor(
        private $element: IAugmentedJQuery,
        private $scope: IScope
    ) {}

    $postLink(): void {
        this.$element.attr("type", "button")
        this.$element.addClass("accordion-button")

        this.disableWatcher = this.$scope.$watch(() => this.item.disabled, value => {
            this.$element.attr("disabled", `${value}`)
        })
    }

    $onDestroy(): void {
        this.disableWatcher?.()
    }

    static get $name() {
        return "ngbAccordionButton"
    }

    static get $inject() {
        return ["$element", "$scope"]
    }

    static get $factory(): () => IDirective {
        return () => ({
            controller: NgbAccordionButton,
            bindToController: true,
            restrict: "A",
            controllerAs: "$",
            require: {
                item: "^^ngbAccordionItem"
            },
        })
    }
}
