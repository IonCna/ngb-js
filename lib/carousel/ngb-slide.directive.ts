import type { IController, IDirective, ITranscludeFunction } from "angular";
import type { NgbCarousel, NgbSingleSlideEvent } from "@/carousel/ngb-carousel.component"
import type { INgbEvent } from "@/utils";

let slideCounter = 0

export class NgbSlide implements IController {
    public id!: string
    public slid?: ({ $event }: INgbEvent<NgbSingleSlideEvent>) => void 
    protected carousel!: NgbCarousel

    constructor(
        public readonly $transclude: ITranscludeFunction
    ) {}

    $onInit(): void {
        this.id = this.id ?? `ngb-slide-${slideCounter++}`
        if(!this.carousel) throw new Error("ngb-slide only can be used inside of ngb-carousel component");
    }

    $postLink(): void {
        this.carousel.register(this)
    }

    static get $factory(): () => IDirective {
        return () => ({
            require: {
                carousel: "^ngbCarousel"
            },
            controller: NgbSlide,
            scope: {
                slid: "&?",
                id: "@?"
            },
            bindToController: true,
            controllerAs: "$",
            restrict: "A",
            transclude: "element"
        })
    }

    static get $inject() {
        return ["$transclude"]
    }

    static get $name() {
        return "ngbSlide"
    }

    //#endregion
}
