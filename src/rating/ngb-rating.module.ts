import { NgbRating } from "@ngb/rating/ngb-rating.component";
import { NgModule } from "ngjs-core";
import { CommonModule } from "ngjs-core/common";

@NgModule({
  id: "ngb.rating",
  imports: [CommonModule],
  declarations: [NgbRating],
})
export class NgbRatingModule {}
