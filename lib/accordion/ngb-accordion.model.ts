import type { NgbAccordionItem } from "@/accordion/ngb-accordion-item.directive"

export type NgbAccordionItemRegistry = {
    watcher: () => void
    item: NgbAccordionItem
}
