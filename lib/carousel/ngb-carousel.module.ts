import angular from "angular";
import { NgbCarousel } from "@/carousel/ngb-carousel.component"
import { NgbCarouselConfig } from "@/carousel/ngb-carousel-config.service"
import { NgbSlide } from "@/carousel/ngb-slide.directive"
import { NgbCarouselCounter, NgbSlideCounter } from "@/carousel/ngb-carousel-counter.value"

export const NgbCarouselModule = angular.module("ngb.carousel", [])

NgbCarouselModule.directive(NgbSlide.$name, NgbSlide.$factory)
NgbCarouselModule.component(NgbCarousel.$name, NgbCarousel.$factory)
NgbCarouselModule.service(NgbCarouselConfig.$name, NgbCarouselConfig)

NgbCarouselModule.value(NgbCarouselCounter, 0)
NgbCarouselModule.value(NgbSlideCounter, 0)
