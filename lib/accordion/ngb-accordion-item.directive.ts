import type { IAugmentedJQuery, IController, IDirective, IScope } from "angular"
import { NgbAccordionCounterService } from "@/accordion/ngb-accordion-counters.service"
import { NgbAccordionConfig } from "@/accordion/ngb-accordion-config.service"
import { NgbAccordionRegisterEvent } from "@/accordion/ngb-accordion.events"
import { NgbAccordion } from "@/accordion/ngb-accordion.directive"

export class NgbAccordionItem implements IController {
    private ngbAccordion!: NgbAccordion

    protected collapsed?: boolean;
    protected destroyOnHide?: boolean
    protected disabled?: boolean
    protected ngbAccordionItem?: string
    protected hidden?: () => void
    protected hide?: () => void
    protected show?: () => void
    protected shown?: () => void

    private id!: string

    constructor(
        private $element: IAugmentedJQuery,
        private $ngbAccordionItemCounter: NgbAccordionCounterService,
        private $ngbAccordionConfig: NgbAccordionConfig,
        protected $scope: IScope
    ) {}

    $onInit(): void {
        this.id = this.ngbAccordionItem ?? `ngb-accordion-item-${this.$ngbAccordionItemCounter.accordionItemCounter++}`
        this.destroyOnHide = this.destroyOnHide ?? this.$ngbAccordionConfig.destroyOnHide
        this.collapsed = this.collapsed ?? true

        this.ngbAccordion["$scope"].$emit(NgbAccordionRegisterEvent, this)
    }

    public toggle() { }

    public expand() {
        if(this.collapsed) return
        this.collapsed = true
    }

    public collapse() {
        if(!this.collapsed) return;
        this.collapsed = false
    }

    $postLink(): void {
        this.$element.addClass("accordion-item")
        this.$element.attr("id", this.id)
    }

    $onDestroy(): void {
        this.$ngbAccordionItemCounter.accordionItemCounter--
    }

    static get $inject() {
        return [
            "$element",
            NgbAccordionCounterService.$name,
            NgbAccordionConfig.$name,
            "$scope"
        ]
    }

    static get $name() {
        return "ngbAccordionItem"
    }

    static get $factory(): () => IDirective {
        return () => ({
            bindToController: true,
            controller: NgbAccordionItem,
            require: {
                ngbAccordion: "^ngbAccordion"
            },
            restrict: "A",
            scope: {
                collapsed: "=?",
                destroyOnHide: "<?",
                disabled: "<?",
                ngbAccordionItem: "<?",
                hidden: "&?",
                hide: "&?",
                show: "&?",
                shown: "&?"
            }
        })
    }
}