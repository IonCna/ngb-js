import type { NgbCarousel, NgbSingleSlideEvent } from "@ngb/carousel/ngb-carousel.component";
import type { INgbEvent } from "@ngb/utils";
import type { IController, IDirective } from "angular";

let slideCounter = 0;

export class NgbSlide implements IController {
  public carousel!: NgbCarousel;
  public id!: string;
  public slid?: ({ $event }: INgbEvent<NgbSingleSlideEvent>) => void;

  $onInit(): void {
    this.id = this.id ?? `ngb-slide-${slideCounter++}`;
  }

  static get $factory(): () => IDirective {
    return () => ({
      controller: NgbSlide,
      scope: true,
      bindToController: {
        slid: "&?",
        id: "@?",
      },
      require: {
        carousel: "^^ngbCarousel",
      },
      restrict: "A",
    });
  }

  static get $name() {
    return "ngbSlide";
  }

  //#endregion
}
