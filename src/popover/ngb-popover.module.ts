import { NgbPopover } from "@ngb/popover/ngb-popover.directive";
import { NgbPopoverConfig } from "@ngb/popover/ngb-popover-config.service";
import { NgbPopoverWindow } from "@ngb/popover/ngb-popover-window.component";
import { NGB_POPOVER_CONFIG } from "@ngb/popover/tokens";
import { inject, NgModule } from "ngjs-core";
import { CommonModule } from "ngjs-core/common";

@NgModule({
  id: "ngb.popover",
  imports: [CommonModule],
  declarations: [NgbPopover, NgbPopoverWindow],
  providers: [{ provide: NGB_POPOVER_CONFIG, useFactory: () => inject(NgbPopoverConfig) }],
})
export class NgbPopoverModule {}
