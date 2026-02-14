import type { IAttributes, IAugmentedJQuery, ICompileService, IController, IDirective, IScope } from "angular";
import { NgbAccordionItem } from "@/accordion/ngb-accordion-item.directive"
import type { NgbCollapse } from "@/collapse/ngb-collapse.directive"
import template from "@/accordion/ngb-accordion-collapse.directive.html?raw"

export class NgbAccordionCollapse implements IController {
    private ngbAccordionItem!: NgbAccordionItem
    constructor(private $element: IAugmentedJQuery, private $scope: IScope) { }

    $postLink(): void {
        this.$element.addClass("accordion-collapse")
        console.log(this.$scope)
    }

    static get $name() {
        return "ngbAccordionCollapse"
    }

    static get $inject() {
        return ["$element", "$scope"]
    }

    static get $factory(): () => IDirective {
        return () => ({
            bindToController: true,
            require: {
                ngbAccordionItem: "^^ngbAccordionItem",
                ngbCollapse: "ngbCollapse"
            },
            restrict: "A",
            replace: true,
            transclude: true,
            controllerAs: "$",
            template,
            controller: NgbAccordionCollapse,
        })
    }
}