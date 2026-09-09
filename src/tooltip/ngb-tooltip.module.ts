import { NgbTooltip } from "@ngb/tooltip/ngb-tooltip.directive";
import { NgbTooltipConfig } from "@ngb/tooltip/ngb-tooltip-config.service";
import { NgbTooltipWindow } from "@ngb/tooltip/ngb-tooltip-window.component";
import { NGB_TOOLTIP_CONFIG } from "@ngb/tooltip/tokens";
import { inject, NgModule } from "ngjs-core";
import { CommonModule } from "ngjs-core/common";

@NgModule({
  id: "ngb.tooltip",
  imports: [CommonModule],
  declarations: [NgbTooltip, NgbTooltipWindow],
  providers: [{ provide: NGB_TOOLTIP_CONFIG, useFactory: () => inject(NgbTooltipConfig) }],
})
export class NgbTooltipModule {}
