import type { IAugmentedJQuery, IController, IDirective, IScope } from "angular";
import { NgbAccordionConfig } from "@/accordion/ngb-accordion-config.service"
import { NgbAccordionRegisterEvent, NgbAccordionItemChange } from "@/accordion/ngb-accordion.events"
import type { NgbAccordionItem } from "@/accordion/ngb-accordion-item.directive"
import type { NgbAccordionItemRegistry } from "@/accordion/ngb-accordion.model"

export class NgbAccordion implements IController {
    protected animation?: boolean
    protected closeOthers?: boolean
    protected destroyOnHide?: boolean
    protected hidden?: () => void
    protected hide?: () => void
    protected show?: () => void
    protected shown?: () => void

    private ngbAccordionItems = new Map<string, NgbAccordionItemRegistry>()
    private itemsRegisterHandler?: () => void

    constructor(
        private $element: IAugmentedJQuery,
        private accordionConfig: NgbAccordionConfig,
        private $scope: IScope
    ) { }

    $onInit(): void {
        this.animation = this.animation ?? this.accordionConfig.animation
        this.closeOthers = this.closeOthers ?? this.accordionConfig.closeOthers
        this.destroyOnHide = this.destroyOnHide ?? this.accordionConfig.destroyOnHide

        this.itemsRegisterHandler = this.$scope.$on(NgbAccordionRegisterEvent, (event, ngbAccordionItem: NgbAccordionItem) => {
            event.stopPropagation?.()
            const id = ngbAccordionItem["id"]

            const alreadyExist = this.ngbAccordionItems.has(id)
            if (alreadyExist) throw new Error(`[ngbAccordion]: Duplicate id ${id}`);

            this.ngbAccordionItems.set(id, {
                item: ngbAccordionItem,
                watcher: ngbAccordionItem["$scope"].$watch(() => ngbAccordionItem["collapsed"], (current, prev) => {
                    if(current == prev) return
                    if (!this.closeOthers) return
                    if (current) return

                    this.collapseAllExcept(id)
                })
            })
        })

        this.$scope.$on(NgbAccordionItemChange, () => {
            
        })
    }

    $postLink(): void {
        this.$element.addClass("accordion")
    }

    $onDestroy(): void {
        this.itemsRegisterHandler?.()

        this.ngbAccordionItems.forEach((accordionItem) => {
            accordionItem.watcher?.()
        })
    }

    public toggle(itemId: string) {
        const exist = this.ngbAccordionItems.has(itemId)
        if (!exist) throw new Error(`[NgbAccordion]: ${itemId} not found`);

        const { item } = this.ngbAccordionItems.get(itemId)!
        item.toggle()
    }

    public isExpanded(itemId: string) {
        const exist = this.ngbAccordionItems.has(itemId)
        if (!exist) throw new Error(`[NgbAccordion]: ${itemId} not found`);

        const { item } = this.ngbAccordionItems.get(itemId)!
        return item["collapsed"]!
    }

    public collapseAll() {
        this.ngbAccordionItems.forEach(({ item }) => {
            item.collapse()
        })
    }

    private collapseAllExcept(itemId: string) {
        this.ngbAccordionItems.forEach(({ item }) => {
            if (item["id"] === itemId) return
            item.collapse()
        })
    }

    static get $name() {
        return "ngbAccordion"
    }

    static get $factory(): () => IDirective {
        return () => ({
            bindToController: true,
            controller: NgbAccordion,
            restrict: "A",
            scope: {
                animation: "<?",
                closeOthers: "<?",
                destroyOnHide: "<?",
                hidden: "&?",
                hide: "&?",
                show: "&?",
                shown: "&?"
            }
        })
    }

    static get $inject() {
        return [
            "$element",
            NgbAccordionConfig.$name,
            "$scope"
        ]
    }
}
