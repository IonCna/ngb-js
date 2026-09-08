import { NgbProgressbar } from "@ngb/progressbar/ngb-progressbar.component";
import { NgbProgressbarPercentFilter } from "@ngb/progressbar/ngb-progressbar-percent.filter";
import { NgbProgressbarStacked } from "@ngb/progressbar/ngb-progressbar-stacked.component";
import { CommonModule } from "ngjs-core/common";
import { NgModule } from "ngjs-core";

@NgModule({
  id: "ngb.progressbar",
  imports: [CommonModule],
  declarations: [NgbProgressbar, NgbProgressbarStacked, NgbProgressbarPercentFilter],
})
export class NgbProgressbarModule {}
