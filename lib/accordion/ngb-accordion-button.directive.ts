import type { IAugmentedJQuery, IController, IDirective, IScope } from "angular";
import type { NgbAccordionItem } from "@/accordion/ngb-accordion-item.directive"

export class NgbAccordionButton implements IController {
    protected ngbAccordionItem!: NgbAccordionItem
    constructor(private $element: IAugmentedJQuery, private $scope: IScope) { }

    $postLink(): void {
        this.$element.addClass("accordion-button") // collapsed
        this.$element.attr("type", "button")

        const handler = () => this.$scope.$evalAsync(() => this.ngbAccordionItem.toggle())
        this.$element.on("click", handler)

        this.$scope.$watch(() => this.collapsed, (collapsed) => {
            this.$element.toggleClass("collapsed", collapsed)
        })
    }

    private get collapsed() {
        return this.ngbAccordionItem["collapsed"] ?? false
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
            scope: true,
            restrict: "A",
            controllerAs: "$",
            require: {
                ngbAccordionItem: "^^ngbAccordionItem"
            },
        })
    }
}
