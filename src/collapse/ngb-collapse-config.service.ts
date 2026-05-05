import { NgbConfig } from "@ngb/ngb-config.service"

export class NgbCollapseConfig {
    private _animation?: boolean
    public horizontal: boolean = false

    constructor(private ngbConfig: NgbConfig) {}

    public get animation() {
        return this._animation ?? this.ngbConfig.animation
    }

    public set animation(animation: boolean) {
        this._animation = animation
    }

    static get $inject() {
        return [NgbConfig.$name]
    }

    static get $name() {
        return "ngb.collapse.config.service"
    }
}
