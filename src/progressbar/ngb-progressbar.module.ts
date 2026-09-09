import { NgbProgressbar } from "@ngb/progressbar/ngb-progressbar.component";
import { NgbProgressbarConfig } from "@ngb/progressbar/ngb-progressbar-config.service";
import { NgbProgressbarPercentFilter } from "@ngb/progressbar/ngb-progressbar-percent.filter";
import { NgbProgressbarStacked } from "@ngb/progressbar/ngb-progressbar-stacked.component";
import { NGB_PROGRESSBAR_CONFIG } from "@ngb/progressbar/tokens";
import { inject, NgModule } from "ngjs-core";
import { CommonModule } from "ngjs-core/common";

@NgModule({
  id: "ngb.progressbar",
  imports: [CommonModule],
  declarations: [NgbProgressbar, NgbProgressbarStacked, NgbProgressbarPercentFilter],
  providers: [{ provide: NGB_PROGRESSBAR_CONFIG, useFactory: () => inject(NgbProgressbarConfig) }],
})
export class NgbProgressbarModule {}
