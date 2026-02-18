import { NgbConfig } from "../ngb-config.service"

export class NgbCarouselConfig {
    public _animation?: boolean
    public interval = 5000
    public keyboard = true
    public pauseOnFocus = true
    public pauseOnHover = true
    public showNavigationArrows = true
    public showNavigationIndicators = true
    public wrap = true

    constructor(
        private ngbConfig: NgbConfig
    ) {}

    public get animation() {
        return this._animation ?? this.ngbConfig.animation
    }

    public set animation(value: boolean) {
        this._animation = value
    }

    static get $inject() {
        return [NgbConfig.$name]
    }

    static get $name() {
        return "ngb.carousel.config.service"
    }
}
