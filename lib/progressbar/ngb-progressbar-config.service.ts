export class NgbProgressbarConfig {
    public ariaLabel = "progress bar"
    public animated = false
    public height: string = ""
    public max = 100
    public showValue = false
    public striped = false
    public textType: "success" | "info" | "warning" | "danger" | "primary" | "secondary" | "dark" = "warning"
    public type: "success" | "info" | "warning" | "danger" | "primary" | "secondary" | "dark" = "warning"

    static get $name() {
        return "ngb.progressbar.config.service"
    }
}
