import { NgbConfig } from "@ngb/ngb-config.service";
import { NgbPopover } from "@ngb/popover/ngb-popover.directive";
import { NgbPopoverConfig } from "@ngb/popover/ngb-popover-config.service";
import { NgbPopoverWindow } from "@ngb/popover/ngb-popover-window";
import { NgbRTL } from "@ngb/utils/rtl.service";
import angular, { type IModule } from "angular";
import { CommonModule } from "ngjs-core/runtime/common";

export const NgbPopoverModule: IModule = angular.module("ngb.popover", [CommonModule.name]);

NgbPopoverModule.service(NgbConfig.$name, NgbConfig);
NgbPopoverModule.service(NgbRTL.$name, NgbRTL);
NgbPopoverModule.service(NgbPopoverConfig.$name, NgbPopoverConfig);

NgbPopoverModule.component(NgbPopoverWindow.$name, NgbPopoverWindow.$factory);
NgbPopoverModule.directive(NgbPopover.$name, NgbPopover.$factory);

export { NgbPopover, NgbPopoverConfig };
