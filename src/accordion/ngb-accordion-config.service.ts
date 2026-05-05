import { NgbConfig } from "@ngb/ngb-config.service"

export class NgbAccordionConfig {
    private _animation?: boolean

    public closeOthers = false
    public destroyOnHide = true

    constructor(private ngbConfig: NgbConfig) {}

    get animation() {
        return this._animation ?? this.ngbConfig.animation
    }

    set animation(animation: boolean) {
        this._animation = animation
    }

    static get $inject() {
        return [NgbConfig.$name]
    }

    static get $name() {
        return "ngb.accordion.config.service"
    }
}