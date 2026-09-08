import { NgbCarousel } from "@ngb/carousel/ngb-carousel.component";
import { NgbSlide } from "@ngb/carousel/ngb-slide.directive";
import { NgModule } from "ngjs-core";
import { CommonModule } from "ngjs-core/common";

export { NgbCarousel, type NgbSlideEvent, NgbSlideEventSource } from "@ngb/carousel/ngb-carousel.component";
export { NgbCarouselConfig } from "@ngb/carousel/ngb-carousel-config.service";
export { NgbSlideEventDirection } from "@ngb/carousel/ngb-carousel-transition";
export { NgbSlide } from "@ngb/carousel/ngb-slide.directive";

@NgModule({
  id: "ngb.carousel",
  imports: [CommonModule],
  declarations: [NgbCarousel, NgbSlide],
})
export class NgbCarouselModule {}
