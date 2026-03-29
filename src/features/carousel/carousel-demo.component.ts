import type { IComponentOptions } from "angular"
import type { NgbSlideEvent } from "@/carousel/ngb-carousel.module"

export class CarouselDemoComponent {
    public activeId = "slide-1"
    public lastSlideEvent = "sin eventos"
    public lastSlidEvent = "sin eventos"

    public onSlide(event: NgbSlideEvent) {
        this.lastSlideEvent = `${event.prev} -> ${event.current} (${event.source})`
    }

    public onSlid(event: NgbSlideEvent) {
        this.lastSlidEvent = `${event.prev} -> ${event.current} (${event.source})`
    }

    static get $name() {
        return "ngbCarouselDemo"
    }

    static get $factory(): IComponentOptions {
        return {
            controllerAs: "$",
            controller: CarouselDemoComponent,
            template: `
                <div class="vstack gap-2">
                    <ngb-carousel
                        animation="false"
                        interval="0"
                        active-id="$.activeId"
                        show-navigation-arrows="true"
                        show-navigation-indicators="true"
                        slide="$.onSlide($event)"
                        slid="$.onSlid($event)">
                        <div ngb-slide id="slide-1" class="p-4 text-bg-primary">Slide 1</div>
                        <div ngb-slide id="slide-2" class="p-4 text-bg-success">Slide 2</div>
                        <div ngb-slide id="slide-3" class="p-4 text-bg-warning">Slide 3</div>
                    </ngb-carousel>

                    <p class="small text-muted mb-0">slide: {{ $.lastSlideEvent }}</p>
                    <p class="small text-muted mb-0">slid: {{ $.lastSlidEvent }}</p>
                </div>
            `
        }
    }
}
