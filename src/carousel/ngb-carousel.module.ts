import { NgbCarousel } from "@ngb/carousel/ngb-carousel.component";
import { NgbCarouselConfig } from "@ngb/carousel/ngb-carousel-config.service";
import { NgbSlide } from "@ngb/carousel/ngb-slide.directive";
import { NGB_CAROUSEL_CONFIG } from "@ngb/carousel/tokens";
import { inject, NgModule } from "ngjs-core";
import { CommonModule } from "ngjs-core/common";

export { NgbCarousel, type NgbSlideEvent, NgbSlideEventSource } from "@ngb/carousel/ngb-carousel.component";
export { NgbCarouselConfig } from "@ngb/carousel/ngb-carousel-config.service";
export { NgbSlideEventDirection } from "@ngb/carousel/ngb-carousel-transition";
export { NgbSlide } from "@ngb/carousel/ngb-slide.directive";

@NgModule({
  id: "ngb.carousel",
  imports: [CommonModule],
  declarations: [NgbCarousel, NgbSlide],
  providers: [{ provide: NGB_CAROUSEL_CONFIG, useFactory: () => inject(NgbCarouselConfig) }],
})
export class NgbCarouselModule {}
