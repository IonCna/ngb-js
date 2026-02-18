export class NgbTooltipConfig {
    public animation = true
    public autoClose = true
    public closeDelay = 0
    public container!: string
    public disableTooltip = false
    public openDelay = 120
    public placement = "top"
    public popperOptions = true
    public tooltipClass = ""
    public triggers = true

    static get $name() {
        return "ngbTooltipConfig"
    }
}
