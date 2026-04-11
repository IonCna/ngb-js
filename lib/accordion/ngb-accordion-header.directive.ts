import type { IAugmentedJQuery, IController, IDirective, ILogService, IScope } from "angular";
import type { NgbAccordionItem } from "@/accordion/ngb-accordion-item.directive";

export class NgbAccordionHeader implements IController {
    private item!: NgbAccordionItem
    private collapseWatcher?: () => void

    constructor(
        private $element: IAugmentedJQuery,
        private $scope: IScope,
        private $log: ILogService
    ) {}

    $postLink(): void {
        this.$element.addClass("accordion-header")
        this.$element.attr("role", "heading")

        this.collapseWatcher = this.$scope.$watch(() => this.item.collapsed, value => {
            this.$log.info(`[ngb-accordion-header-${this.item.id}] collapse is ${value}`)
            this.$element.toggleClass("collapsed", value)
        })
    }

    $onDestroy(): void {
        this.collapseWatcher?.()
    }

    static get $name() {
        return "ngbAccordionHeader"
    }

    static get $inject() {
        return ["$element", "$scope", "$log"]
    }

    static get $factory(): () => IDirective {
        return () => ({
            bindToController: true,
            require: {
                item: "^ngbAccordionItem"
            },
            controller: NgbAccordionHeader,
            restrict: "A",
        })
    }
}