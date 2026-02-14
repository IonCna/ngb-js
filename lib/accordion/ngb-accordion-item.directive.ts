import type { IAugmentedJQuery, IController, IDirective } from "angular"
import { NgbAccordionCounterService } from "@/accordion/ngb-accordion-counters.service"
import { NgbAccordionConfig } from "@/accordion/ngb-accordion-config.service"

export class NgbAccordionItem implements IController {
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
        private $ngbAccordionConfig: NgbAccordionConfig
    ) {}

    $onInit(): void {
        this.id = this.ngbAccordionItem ?? `ngb-accordion-item-${++this.$ngbAccordionItemCounter.accordionItemCounter}`
        this.destroyOnHide = this.destroyOnHide ?? this.$ngbAccordionConfig.destroyOnHide
    }

    public toggle() { }
    public expand() { }
    public collapse() { }

    $postLink(): void {
        this.$element.addClass("accordion-item")
        this.$element.attr("id", this.id)
    }

    $onDestroy(): void {
        this.$ngbAccordionItemCounter.accordionItemCounter--
    }

    static get $inject() {
        return ["$element", NgbAccordionCounterService.$name, NgbAccordionConfig.$name]
    }

    static get $name() {
        return "ngbAccordionItem"
    }

    static get $factory(): () => IDirective {
        return () => ({
            bindToController: true,
            controller: NgbAccordionItem,
            restrict: "A",
            scope: {
                collapsed: "<?",
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