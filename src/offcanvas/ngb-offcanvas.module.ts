import { NgbOffcanvas } from "@ngb/offcanvas/ngb-offcanvas.service";
import { NgbOffcanvasBackdrop } from "@ngb/offcanvas/ngb-offcanvas-backdrop.component";
import { NgbOffcanvasConfig } from "@ngb/offcanvas/ngb-offcanvas-config.service";
import { NgbOffcanvasStack } from "@ngb/offcanvas/ngb-offcanvas-stack.service";
import { NgbOffcanvasPanel } from "@ngb/offcanvas/ngb-offcanvas-panel.component";
import angular, {type IModule} from "angular";
import { CommonModule } from "ngjs-core/runtime/common";

export const NgbOffcanvasModule: IModule = angular.module("ngb.offcanvas", [CommonModule.name]);
NgbOffcanvasModule.service(NgbOffcanvas.$name, NgbOffcanvas);
NgbOffcanvasModule.service(NgbOffcanvasStack.$name, NgbOffcanvasStack);
NgbOffcanvasModule.service(NgbOffcanvasConfig.$name, NgbOffcanvasConfig);

NgbOffcanvasModule.component(NgbOffcanvasBackdrop.$name, NgbOffcanvasBackdrop.$factory);
NgbOffcanvasModule.component(NgbOffcanvasPanel.$name, NgbOffcanvasPanel.$factory);
