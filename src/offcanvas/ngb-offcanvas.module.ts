import { NgbOffcanvas } from "@ngb/offcanvas/ngb-offcanvas.service";
import { NgbOffcanvasBackdrop } from "@ngb/offcanvas/ngb-offcanvas-backdrop.component";
import { NgbOffcanvasConfig } from "@ngb/offcanvas/ngb-offcanvas-config.service";
import { NgbOffcanvasStack } from "@ngb/offcanvas/ngb-offcanvas-stack.service";
import { NgbOffcanvasPanel } from "@ngb/offcanvas/ngb-offcanvas-panel.component";
import angular from "angular";

export const NgbOffcanvasModule = angular.module("ngb.offcanvas", []);
NgbOffcanvasModule.service(NgbOffcanvas.$name, NgbOffcanvas);
NgbOffcanvasModule.service(NgbOffcanvasStack.$name, NgbOffcanvasStack);
NgbOffcanvasModule.service(NgbOffcanvasConfig.$name, NgbOffcanvasConfig);

NgbOffcanvasModule.component(NgbOffcanvasBackdrop.$name, NgbOffcanvasBackdrop.$factory);
NgbOffcanvasModule.component(NgbOffcanvasPanel.$name, NgbOffcanvasPanel.$factory);
