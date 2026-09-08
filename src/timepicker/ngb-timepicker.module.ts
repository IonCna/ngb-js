import { NgbTimepicker } from "@ngb/timepicker/ngb-timepicker.component";
import { NgbTimeAdapter, NgbTimeStructAdapter } from "@ngb/timepicker/ngb-timepicker-adapter.service"
import { NgbTimepickerConfig } from "@ngb/timepicker/ngb-timepicker-config.service"

import {
    NgbTimepickerI18n,
    NgbTimepickerI18nDefault,
} from "@ngb/timepicker/ngb-timepicker-i18n";

import { CommonModule } from "ngjs-core/common"
import angular from "angular";

export const NgbTimepickerModule = angular.module("ngb.timepicker", [
    CommonModule.name,
]);

NgbTimepickerModule.component(NgbTimepicker.$name, NgbTimepicker.$factory);
NgbTimepickerModule.service(NgbTimepickerConfig.$name, NgbTimepickerConfig)
NgbTimepickerModule.factory(NgbTimeAdapter.$name, NgbTimeStructAdapter.$factory)

NgbTimepickerModule.service(
    NgbTimepickerI18n.$name,
    NgbTimepickerI18nDefault,
);
