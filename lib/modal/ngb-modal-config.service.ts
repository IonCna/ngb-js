import { NgbConfig } from "../ngb-config.service"

export class NgbModalConfig {
    public backdrop = true
    public animation!: boolean

    constructor(ngbConfig: NgbConfig) {
        this.animation = this.animation ?? ngbConfig.animation
    }

    static get $inject() {
        return [NgbConfig.$name]
    }

    static get $name() {
        return "ngbModalConfig"
    }
}