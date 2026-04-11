import angular from "angular";

import { NGB_DATEPICKER_DATE_ADAPTER_FACTORY } from "@/datepicker/adapters/ngb-date-adapter.factory"

export const DatepickerModule = angular.module("ngb.datepicker", [])
DatepickerModule.factory("ngb.datepicker.date.adapter.factory", NGB_DATEPICKER_DATE_ADAPTER_FACTORY)
