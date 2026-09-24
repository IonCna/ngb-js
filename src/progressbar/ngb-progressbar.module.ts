import { NgbProgressbar } from "@ngb/progressbar/ngb-progressbar.component";
import { NgbProgressbarPercentFilter } from "@ngb/progressbar/ngb-progressbar-percent.filter";
import { NgbProgressbarStacked } from "@ngb/progressbar/ngb-progressbar-stacked.component";
import { NgModule } from "ngjs-core";
import { CommonModule } from "ngjs-core/common";

@NgModule({
  imports: [CommonModule],
  declarations: [NgbProgressbar, NgbProgressbarStacked, NgbProgressbarPercentFilter],
})
export class NgbProgressbarModule {}
