import { type Placement, type Options } from "@popperjs/core"

export interface INgbDropdownAnchor {
    nativeElement: HTMLElement
}

export class NgbDropdownConfig {
    public autoClose: boolean | "inside" | "outside" = true
    public container: null | 'body' = null
    public placement: Placement[] = ['bottom-start', 'bottom-end', 'top-start', 'top-end']
    
    public popperOptions = (options?: Partial<Options>) => options

    static get $name() {
        return "ngb.dropdown.config.service"
    }
}
