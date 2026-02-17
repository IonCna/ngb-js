export const NgbAccordionRegisterEvent = "ngb:accordion:register"
export const NgbAccordionUnregisterEvent = "ngb:accordion:unregister"
export const NgbAccordionItemChange = "ngb:accordion:item:change"

export type NgbAccordionItemPhase = "show" | "hide" | "shown" | "hidden"

export type NgbAccordionItemChangePayload = {
    itemId: string
    phase: NgbAccordionItemPhase
}
