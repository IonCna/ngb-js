import { NgbPopover } from "@ngb/popover/ngb-popover.directive";
import { NgbPopoverWindow } from "@ngb/popover/ngb-popover-window.component";
import { NgModule } from "ngjs-core";
import { CommonModule } from "ngjs-core/common";

@NgModule({
  imports: [CommonModule],
  declarations: [NgbPopover, NgbPopoverWindow],
})
export class NgbPopoverModule {}
