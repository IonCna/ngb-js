import { NgbRating } from "@ngb/rating/ngb-rating.component";
import { NgbRatingConfig } from "@ngb/rating/ngb-rating-config.service";
import angular, {type IModule} from "angular";
import { CommonModule } from "ngjs-core";

export const NgbRatingModule: IModule = angular.module("ngb.rating", [CommonModule.name]);
NgbRatingModule.component(NgbRating.$name, NgbRating.$factory);
NgbRatingModule.service(NgbRatingConfig.$name, NgbRatingConfig);
