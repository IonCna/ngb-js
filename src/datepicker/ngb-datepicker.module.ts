import { NgbDatepicker } from "@ngb/datepicker/ngb-datepicker.component.ts";
import { NgbDatepickerConfig } from "@ngb/datepicker/ngb-datepicker-config.service.ts";
import { NgbDatepickerContent } from "@ngb/datepicker/ngb-datepicker-content.component.ts";
import { NgbDatepickerDayView } from "@ngb/datepicker/ngb-datepicker-day-view.component.ts";
import { NgbDatepickerMonth } from "@ngb/datepicker/ngb-datepicker-month.component.ts";
import { NgbDatepickerNavigation } from "@ngb/datepicker/ngb-datepicker-navigation.component.ts";
import { NgbDatepickerNavigationSelect } from "@ngb/datepicker/ngb-datepicker-navigation-select.component.ts";
import { NgbInputDatepicker } from "@ngb/datepicker/ngb-input-datepicker.directive.ts";
import { NgbInputDatepickerConfig } from "@ngb/datepicker/ngb-input-datepicker-config.service.ts";
import { NgbRTL } from "@ngb/utils/rtl.service";
import angular, { type IModule } from "angular";
import { CommonModule } from "ngjs-core/runtime/common";

export const NgbDatepickerModule: IModule = angular.module("ngb.datepicker", [CommonModule.name]);

NgbDatepickerModule.service(NgbRTL.$name, NgbRTL);
NgbDatepickerModule.service(NgbDatepickerConfig.$name, NgbDatepickerConfig);
NgbDatepickerModule.service(NgbInputDatepickerConfig.$name, NgbInputDatepickerConfig);

NgbDatepickerModule.component(NgbDatepicker.$name, NgbDatepicker.$factory);
NgbDatepickerModule.component(NgbDatepickerMonth.$name, NgbDatepickerMonth.$factory);
NgbDatepickerModule.component(NgbDatepickerNavigation.$name, NgbDatepickerNavigation.$factory);
NgbDatepickerModule.component(NgbDatepickerNavigationSelect.$name, NgbDatepickerNavigationSelect.$factory);

NgbDatepickerModule.directive(NgbDatepickerContent.$name, NgbDatepickerContent.$factory);
NgbDatepickerModule.directive(NgbDatepickerDayView.$name, NgbDatepickerDayView.$factory);
NgbDatepickerModule.directive(NgbInputDatepicker.$name, NgbInputDatepicker.$factory);
