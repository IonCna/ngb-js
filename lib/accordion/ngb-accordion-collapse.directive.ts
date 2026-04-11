import type { IAugmentedJQuery, IController, IDirective } from "angular";
import { NgbAccordionItem } from "@/accordion/ngb-accordion-item.directive"
import template from "@/accordion/ngb-accordion-collapse.directive.html?raw"
import type { NgbCollapse } from "@/collapse/ngb-collapse.directive";

export class NgbAccordionCollapse implements IController {
    protected item!: NgbAccordionItem
    protected shouldRender = true

    _collapse!: NgbCollapse

    constructor(
        private $element: IAugmentedJQuery
    ) { }

    $postLink(): void {
        this.$element.addClass("accordion-collapse")
        this.$element.attr("id", this.item.collapseId)
        this.$element.attr("aria-labelledby", this.item.toggleId)

        this.item.register(this)
    }

    register(collapse: NgbCollapse) {
        this._collapse = collapse
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
            scope: true,
            require: {
                item: "^ngbAccordionItem"
            },
            restrict: "A",
            transclude: true,
            controllerAs: "$",
            template,
            controller: NgbAccordionCollapse,
        })
    }
}
