import angular from "angular";
import { NgbCarousel } from "./ngb-carousel.component"
import { NgbCarouselConfig } from "./ngb-carousel-config.service"
import { NgbSlide } from "./ngb-slide.directive"

export const NgbCarouselModule = angular.module("ngb.carousel", [])
export const NGB_CAROUSEL_COUNTER = "ngbCarouselCounter"
export const NGB_CAROUSEL_SLIDE_COUNTER = "ngbCarouselSlideCounter"

NgbCarouselModule.value(NGB_CAROUSEL_COUNTER, 0)
NgbCarouselModule.value(NGB_CAROUSEL_SLIDE_COUNTER, 0)

NgbCarouselModule.directive(NgbSlide.$name, NgbSlide.$factory)
NgbCarouselModule.component(NgbCarousel.$name, NgbCarousel.$factory)
NgbCarouselModule.service(NgbCarouselConfig.$name, NgbCarouselConfig)

export type NgbSlideEventDirection = "start" | "end"
export type NgbSlideEventSource = 'timer' | 'arrowLeft' | 'arrowRight' | 'indicator'

export interface NgbCarouselCtx {
    direction: NgbSlideEventDirection
}

export interface NgbSingleSlideEvent {
    direction: NgbSlideEventDirection
    isShown: boolean
    source: NgbSlideEventSource
}

export interface NgbSlideEvent {
    current: string
    direction: NgbSlideEventDirection
    paused: boolean
    prev: string
    source: NgbSlideEventSource
}
