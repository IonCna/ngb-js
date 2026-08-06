import { NgbRating } from "@ngb/rating/ngb-rating.component";
import { NgbRatingConfig } from "@ngb/rating/ngb-rating-config.service";
import angular from "angular";
import { CommonModule } from "ngjs-core";

export const NgbRatingModule = angular.module("ngb.rating", [CommonModule.name]);
NgbRatingModule.component(NgbRating.$name, NgbRating.$factory);
NgbRatingModule.service(NgbRatingConfig.$name, NgbRatingConfig);
