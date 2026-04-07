import type { IComponentController, IComponentOptions } from "angular";
import template from "@demo/features/demo-carousel/demo-carousel.component.html?raw"

export class DemoCarouselComponent implements IComponentController {

    get images() {
        return [944, 1011, 984].map(number => `https://picsum.photos/id/${number}/900/500`)
    }

    $onInit(): void {
        console.log(this.images)
    }

    static get $name() {
        return "ngbDemoCarousel"
    }

    static get $factory(): IComponentOptions {
        return {
            controller: DemoCarouselComponent,
            controllerAs: "$",
            template
        }
    }
}