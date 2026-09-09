import { NgbRating } from "@ngb/rating/ngb-rating.component";
import { NgbRatingConfig } from "@ngb/rating/ngb-rating-config.service";
import { NGB_RATING_CONFIG } from "@ngb/rating/tokens";
import { inject, NgModule } from "ngjs-core";
import { CommonModule } from "ngjs-core/common";

@NgModule({
  id: "ngb.rating",
  imports: [CommonModule],
  declarations: [NgbRating],
  providers: [{ provide: NGB_RATING_CONFIG, useFactory: () => inject(NgbRatingConfig) }],
})
export class NgbRatingModule {}
