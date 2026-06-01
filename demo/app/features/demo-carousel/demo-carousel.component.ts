import type { IComponentController, IComponentOptions } from "angular";
import template from "@demo/features/demo-carousel/demo-carousel.component.html";

export class DemoCarouselComponent implements IComponentController {
	public activeId = "slide-1";
	public animation = true;
	public interval = 5000;
	public keyboard = true;
	public pauseOnFocus = true;
	public pauseOnHover = true;
	public showNavigationArrows = true;
	public showNavigationIndicators = true;
	public wrap = true;
	public paused = false;
	public lastEvent = "Ready";

	get images() {
		return [944, 1011, 984].map(
			(number) => `https://picsum.photos/id/${number}/900/500`,
		);
	}

	public onSlide({
		current,
		prev,
		direction,
		source,
	}: {
		current: string;
		prev: string;
		direction: string;
		source: string;
	}) {
		this.lastEvent = `Sliding ${prev} -> ${current} (${direction}, ${source})`;
	}

	public onSlid({
		current,
		prev,
		direction,
		source,
	}: {
		current: string;
		prev: string;
		direction: string;
		source: string;
	}) {
		this.activeId = current;
		this.lastEvent = `Active ${current} after ${prev} (${direction}, ${source})`;
	}

	public toggleAnimation() {
		this.animation = !this.animation;
	}

	public toggleWrap() {
		this.wrap = !this.wrap;
	}

	public toggleKeyboard() {
		this.keyboard = !this.keyboard;
	}

	public togglePauseOnFocus() {
		this.pauseOnFocus = !this.pauseOnFocus;
	}

	public togglePauseOnHover() {
		this.pauseOnHover = !this.pauseOnHover;
	}

	public toggleArrows() {
		this.showNavigationArrows = !this.showNavigationArrows;
	}

	public toggleIndicators() {
		this.showNavigationIndicators = !this.showNavigationIndicators;
	}

	public togglePause() {
		this.paused = !this.paused;
	}

	public select(slideId: string) {
		this.activeId = slideId;
	}

	public setInterval(interval: number) {
		this.interval = interval;
		this.paused = interval === 0;
	}

	static get $name() {
		return "ngbDemoCarousel";
	}

	static get $factory(): IComponentOptions {
		return {
			controller: DemoCarouselComponent,
			controllerAs: "$",
			template,
		};
	}
}
