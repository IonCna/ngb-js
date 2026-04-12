import { NgbConfig } from "../ngb-config.service"

export class NgbModalConfig {
    public backdrop = true
    private _animation?: boolean

    constructor(private ngbConfig: NgbConfig) {}

    get animation() {
        return this._animation ?? this.ngbConfig.animation
    }

    set animation(value: boolean) {
        this._animation = value
    }

    static get $inject() {
        return [NgbConfig.$name]
    }

    static get $name() {
        return "ngbModalConfig"
    }
}