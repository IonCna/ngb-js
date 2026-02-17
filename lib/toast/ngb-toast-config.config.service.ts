import { NgbConfig } from "@/ngb-config.service"

export class NgbToastConfig {
    private _animation!: boolean
    public ariaLive: 'polite' | 'assertive' = 'polite';
    public autohide = true
    public delay = 5000

    constructor(private ngbConfig: NgbConfig) {}

    public get animation() {
        return this._animation ?? this.ngbConfig.animation
    }

    set animation(animation: boolean) {
        this._animation = animation
    }

    static get $inject() {
        return [NgbConfig.$name]
    }

    static get $name() {
        return "ngb.toast.config.service"
    }
}
