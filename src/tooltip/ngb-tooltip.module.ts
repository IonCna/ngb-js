import { NgbTooltip } from "@ngb/tooltip/ngb-tooltip.directive";
import { NgbTooltipWindow } from "@ngb/tooltip/ngb-tooltip-window.component";
import { NgModule } from "ngjs-core";
import { CommonModule } from "ngjs-core/common";

@NgModule({
  id: "ngb.tooltip",
  imports: [CommonModule],
  declarations: [NgbTooltip, NgbTooltipWindow],
})
export class NgbTooltipModule {}
