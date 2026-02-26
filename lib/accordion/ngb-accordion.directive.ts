import type { IAugmentedJQuery, IController, IDirective, IScope } from "angular";
import { NgbAccordionConfig } from "@/accordion/ngb-accordion-config.service"
import { NgbAccordionRegisterEvent, NgbAccordionItemChange, NgbAccordionUnregisterEvent, type NgbAccordionItemChangePayload } from "@/accordion/ngb-accordion.events"
import type { NgbAccordionItem } from "@/accordion/ngb-accordion-item.directive"
import type { NgbAccordionItemRegistry } from "@/accordion/ngb-accordion.model"
import template from "@/accordion/ngb-accordion.directive.html?raw"

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
    private itemChangeHandler?: () => void
    private itemUnregisterHandler?: () => void

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
            const id = ngbAccordionItem.getId()

            const alreadyExist = this.ngbAccordionItems.has(id)
            if (alreadyExist) throw new Error(`[ngbAccordion]: Duplicate id ${id}`);

            this.ngbAccordionItems.set(id, {
                item: ngbAccordionItem,
                watcher: ngbAccordionItem["$scope"].$watch(() => ngbAccordionItem["collapsed"], (current, prev) => {
                    if (current == prev) return
                    if (!this.closeOthers) return
                    if (current) return

                    this.collapseAllExcept(id)
                })
            })

            if (this.closeOthers && !ngbAccordionItem["collapsed"]) {
                this.collapseAllExcept(id)
            }
        })

        this.itemUnregisterHandler = this.$scope.$on(NgbAccordionUnregisterEvent, (event, id: string) => {
            event.stopPropagation?.()
            const item = this.ngbAccordionItems.get(id)
            item?.watcher()
            this.ngbAccordionItems.delete(id)
        })

        this.itemChangeHandler = this.$scope.$on(NgbAccordionItemChange, (event, payload: NgbAccordionItemChangePayload) => {
            event.stopPropagation?.()

            const item = this.ngbAccordionItems.get(payload.itemId)?.item
            if (!item) return

            const phases = {
                show: () => {
                    item["show"]?.()
                    this.show?.()
                },
                hide: () => {
                    item["hide"]?.()
                    this.hide?.()
                },
                shown: () => {
                    item["shown"]?.()
                    this.shown?.()
                },
                hidden: () => {
                    item["hidden"]?.()
                    this.hidden?.()
                }
            }

            const callback = phases[payload.phase]
            callback()
        })
    }

    $onDestroy(): void {
        this.itemsRegisterHandler?.()
        this.itemChangeHandler?.()
        this.itemUnregisterHandler?.()

        this.ngbAccordionItems.forEach((accordionItem) => {
            accordionItem.watcher?.()
        })
    }

    public toggle(itemId: string) {
        const item = this.ngbAccordionItems.get(itemId)?.item
        if (!item) return

        if (item["collapsed"]) {
            item.expand()
            return
        }

        item.collapse()
    }

    public isExpanded(itemId: string) {
        const item = this.ngbAccordionItems.get(itemId)?.item
        return item ? !item["collapsed"]! : false
    }

    public collapseAll() {
        this.ngbAccordionItems.forEach(({ item }) => {
            item.collapse()
        })
    }

    public expand(itemId: string) {
        this.ngbAccordionItems.get(itemId)?.item.expand()
    }

    public collapse(itemId: string) {
        this.ngbAccordionItems.get(itemId)?.item.collapse()
    }

    public expandAll() {
        if (this.closeOthers) {
            const opened = Array.from(this.ngbAccordionItems.values()).some(({ item }) => !item["collapsed"])
            if (opened) return

            const first = this.ngbAccordionItems.values().next().value as NgbAccordionItemRegistry | undefined
            first?.item.expand()
            return
        }

        this.ngbAccordionItems.forEach(({ item }) => {
            item.expand()
        })
    }

    private collapseAllExcept(itemId: string) {
        this.ngbAccordionItems.forEach(({ item }) => {
            if (item.getId() === itemId) return
            item.collapse()
        })
    }

    static get $name() {
        return "ngbAccordion"
    }

    static get $factory(): () => IDirective {
        return () => ({
            bindToController: true,
            replace: true,
            transclude: true,
            template,
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
