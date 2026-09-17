import { NgbProgressbar } from "@ngb/progressbar/ngb-progressbar.component";
import { NgbProgressbarStacked } from "@ngb/progressbar/ngb-progressbar-stacked.component";
import { NgModule } from "ngjs-core";
import { CommonModule } from "ngjs-core/common";

@NgModule({
  id: "ngb.progressbar",
  imports: [CommonModule],
  declarations: [NgbProgressbar, NgbProgressbarStacked],
})
export class NgbProgressbarModule {}
