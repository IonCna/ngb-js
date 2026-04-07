import type { IAugmentedJQuery, IController, IDirective, IScope } from "angular";
import type { NgbAccordionItem } from "@/accordion/ngb-accordion-item.directive"
import { NgbHostSynchronizerFactory, type IHostSynchronizer } from "@/ngb-sync-host.factory"

export class NgbAccordionButton implements IController {
    protected ngbAccordionItem!: NgbAccordionItem
    private hostSync?: IHostSynchronizer

    constructor(
        private hostSyncFactory: NgbHostSynchronizerFactory,
        private $element: IAugmentedJQuery,
        private $scope: IScope
    ) {}

    private clickHandler = this.onClick.bind(this)

    $postLink(): void {
        this.hostSync = this.hostSyncFactory.$create(this.$element, this.$scope, {
            attributes: {
                disabled: () => this.disabled,
                "aria-expanded": () => !this.collapsed
            },
            classNames: {
                collapsed: () => this.collapsed
            }
        })

        this.$element.attr("type", "button")
        this.$element.addClass("accordion-button")
        this.$element.on("click", this.clickHandler)
    }

    private onClick() {
        console.log(this)
        this.ngbAccordionItem.toggle()
    }

    $onDestroy(): void {
        this.$element.off("click", this.clickHandler)
        this.hostSync?.$destroy()
    }

    protected get collapsed() {
        return this.ngbAccordionItem["collapsed"] ?? false
    }

    protected get disabled() {
        return this.ngbAccordionItem["disabled"] ?? false
    }

    static get $name() {
        return "ngbAccordionButton"
    }

    static get $inject() {
        return [NgbHostSynchronizerFactory.$name, "$element", "$scope"]
    }

    static get $factory(): () => IDirective {
        return () => ({
            controller: NgbAccordionButton,
            bindToController: true,
            scope: true,
            transclude: true,
            restrict: "A",
            controllerAs: "$",
            template: '<ng-transclude></ng-transclude>',
            require: {
                ngbAccordionItem: "^^ngbAccordionItem"
            },
        })
    }
}
