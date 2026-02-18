import { NgbConfig } from "../ngb-config.service"

export class NgbNavConfig {
    public animation!: boolean
    public destroyOnHide!: boolean
    public keyboard!: boolean
    public orientation!: 'vertical' | 'horizontal'
    public roles!: unknown

    constructor(ngbConfig: NgbConfig) {
        this.animation = this.animation ?? ngbConfig.animation
        this.destroyOnHide = this.destroyOnHide ?? true
        this.keyboard = this.keyboard ?? true
        this.orientation = this.orientation ?? "horizontal"
    }

    static get $inject() {
        return [NgbConfig.$name]
    }

    static get $name() {
        return "ngbNavConfig"
    }
}