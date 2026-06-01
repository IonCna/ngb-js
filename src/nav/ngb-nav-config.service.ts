import { NgbConfig } from "@ngb/ngb-config.service";

export class NgbNavConfig {
	public _animation?: boolean;
	public destroyOnHide = true;
	public keyboard = true;
	public orientation: "vertical" | "horizontal" = "horizontal";
	public roles!: unknown;

	constructor(private ngbConfig: NgbConfig) {}

	public get animation() {
		return this._animation ?? this.ngbConfig.animation;
	}

	public set animation(value: boolean) {
		this._animation = value;
	}

	static get $inject() {
		return [NgbConfig.$name];
	}

	static get $name() {
		return "ngb.nav.config.service";
	}
}
