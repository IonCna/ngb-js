import { type Placement, type ComputePositionConfig, flip, shift } from "@floating-ui/dom"

export class NgbDropdownConfig {
    public animation = true
    public autoClose: boolean | "inside" | "outside" = true
    public container: null | 'body' = null
    public placement: Placement[] = ['bottom-start', 'bottom-end', 'top-start', 'top-end']
    
    public popperOptions(opts?: Partial<ComputePositionConfig>): Partial<ComputePositionConfig> {
        return {
            ...opts,
            strategy: "absolute",
            middleware: [
                flip({
                    fallbackAxisSideDirection: "start",
                    fallbackPlacements: this.placement
                }),
                shift()
            ]
        }
    }

    static get $name() {
        return "ngb.dropdown.config.service"
    }
}
