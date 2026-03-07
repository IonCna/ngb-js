import { NgbConfig } from "@/ngb-config.service"
import type { StyleTypes } from "@/ngb.model"

export class NgbAlertConfig {
    private _animation?: boolean;

    constructor(private ngbConfig: NgbConfig) { }

    public dismissible = true;
    public type: StyleTypes = "warning"

    get animation() {
        return this._animation ?? this.ngbConfig.animation
    }

    set animation(animation: boolean) {
        this._animation = animation
    }

    static get $name() {
        return "ngb.alert.config.service"
    }

    static get $inject() {
        return [NgbConfig.$name]
    }
}
