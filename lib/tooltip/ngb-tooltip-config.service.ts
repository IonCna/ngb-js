import type { Placement } from "@floating-ui/dom"

export class NgbTooltipConfig {
    public animation = true
    public autoClose = true
    public closeDelay = 0
    public container = ""
    public disableTooltip = false
    public openDelay = 120
    public placement: Placement = "top"
    public popperOptions: unknown = null
    public tooltipClass = ""
    public triggers = "hover focus"

    static get $name() {
        return "ngbTooltipConfig"
    }
}
