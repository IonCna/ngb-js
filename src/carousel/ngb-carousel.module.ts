import { NgbCarousel } from "@ngb/carousel/ngb-carousel.component";
import { NgbCarouselConfig } from "@ngb/carousel/ngb-carousel-config.service";
import { NgbSlide } from "@ngb/carousel/ngb-slide.directive";
import angular from "angular";
import { CommonModule } from "ngjs-core";

export const NgbCarouselModule = angular.module("ngb.carousel", [CommonModule.name]);

NgbCarouselModule.directive(NgbSlide.$name, NgbSlide.$factory);
NgbCarouselModule.component(NgbCarousel.$name, NgbCarousel.$factory);
NgbCarouselModule.service(NgbCarouselConfig.$name, NgbCarouselConfig);
