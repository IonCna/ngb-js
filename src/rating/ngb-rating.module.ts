import { NgbRating } from "@ngb/rating/ngb-rating.component";
import { CommonModule } from "ngjs-core/common";
import { NgModule } from "ngjs-core";

@NgModule({
  id: "ngb.rating",
  imports: [CommonModule],
  declarations: [NgbRating],
})
export class NgbRatingModule {}
