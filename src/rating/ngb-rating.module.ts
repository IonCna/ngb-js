import { NgbRatingConfig } from "@ngb/rating/ngb-rating-config.service";
import { NgbRating } from "@ngb/rating/ngb-rating.component";
import { CommonModule } from "ngjs-core/runtime/common";
import { NgModule } from "ngjs-core/runtime/core";

@NgModule({
  id: "ngb.rating",
  imports: [CommonModule],
  declarations: [NgbRating],
  providers: [NgbRatingConfig],
})
export class NgbRatingModule {}
