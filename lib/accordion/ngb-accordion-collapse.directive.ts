import type { IAugmentedJQuery, IController, IDirective } from "angular";
import { NgbAccordionItem } from "@/accordion/ngb-accordion-item.directive"
import template from "@/accordion/ngb-accordion-collapse.directive.html?raw"
import type { NgbCollapse } from "@/collapse/ngb-collapse.directive";

export class NgbAccordionCollapse implements IController {
    protected item!: NgbAccordionItem

    _collapse!: NgbCollapse

    constructor(
        private $element: IAugmentedJQuery
    ) { }

    $postLink(): void {
        this.item.register(this)
    }

    register(collapse: NgbCollapse) {
        this._collapse = collapse
    }

    hidden() {
        this.item.onCollapseHidden()
    }

    shown() {
        this.item.onCollapseShown()
    }

    static get $name() {
        return "ngbAccordionCollapse"
    }

    static get $inject() {
        return ["$element"]
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
