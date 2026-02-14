import type { IAugmentedJQuery, IController, IDirective, IScope } from "angular";
import type { NgbAccordionItem } from "@/accordion/ngb-accordion-item.directive"

export class NgbAccordionButton implements IController {
    protected ngbAccordionItem!: NgbAccordionItem
    constructor(private $element: IAugmentedJQuery, private $scope: IScope) { }

    $postLink(): void {
        this.$element.addClass("accordion-button") // collapsed
        this.$element.attr("type", "button")

        const handler = () => this.$scope.$evalAsync(() =>  this.collapsed = !this.collapsed)
        this.$element.on("click", handler)

        this.$scope.$watch(() => this.collapsed, (collapsed) => {
            this.$element.toggleClass("collapsed", collapsed)
        })
    }

    private get collapsed() {
        return this.ngbAccordionItem["collapsed"] ?? false
    }

    private set collapsed(collapsed: boolean) {
        this.ngbAccordionItem["collapsed"] = collapsed
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
                ngbAccordionItem: "^^ngbAccordionItem"
            },
        })
    }
}