import { NgbRating } from "@ngb/rating/ngb-rating.component";
import { NgbRatingConfig } from "@ngb/rating/ngb-rating-config.service";
import angular from "angular";

export const NgbRatingModule = angular.module("ngb.rating", []);
NgbRatingModule.component(NgbRating.$name, NgbRating.$factory);
NgbRatingModule.service(NgbRatingConfig.$name, NgbRatingConfig);
