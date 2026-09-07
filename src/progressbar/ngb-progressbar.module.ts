import { NgbProgressbar } from "@ngb/progressbar/ngb-progressbar.component";
import { NgbProgressbarConfig } from "@ngb/progressbar/ngb-progressbar-config.service";
import { NgbProgressbarPercentFilter } from "@ngb/progressbar/ngb-progressbar-percent.filter";
import { NgbProgressbarStacked } from "@ngb/progressbar/ngb-progressbar-stacked.component";
import { CommonModule } from "ngjs-core/runtime/common";
import { NgModule } from "ngjs-core/runtime/core";

@NgModule({
  id: "ngb.progressbar",
  imports: [CommonModule],
  declarations: [NgbProgressbar, NgbProgressbarStacked, NgbProgressbarPercentFilter],
  providers: [NgbProgressbarConfig],
})
export class NgbProgressbarModule {}
