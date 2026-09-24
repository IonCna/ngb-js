import { NgbTimepicker } from "@ngb/timepicker/ngb-timepicker.component.ts";
import {
  NgbTimeAdapter,
  NGB_TIMEPICKER_TIME_ADAPTER_FACTORY,
} from "@ngb/timepicker/ngb-timepicker-adapter.service.ts";
import { NgbTimepickerI18n, NgbTimepickerI18nDefault } from "@ngb/timepicker/ngb-timepicker-i18n.ts";
import { NgModule } from "ngjs-core";
import { CommonModule } from "ngjs-core/common";

export { NgbTimepicker } from "@ngb/timepicker/ngb-timepicker.component.ts";
export { NgbTimepickerConfig } from "@ngb/timepicker/ngb-timepicker-config.service.ts";
export type { NgbTimeStruct } from "@ngb/timepicker/ngb-timepicker-struct.ts";
export { NgbTimeAdapter, NgbTimeStructAdapter } from "@ngb/timepicker/ngb-timepicker-adapter.service.ts";
export { NgbTimepickerI18n, NgbTimepickerI18nDefault } from "@ngb/timepicker/ngb-timepicker-i18n.ts";

@NgModule({
  controllerAs: "$",
  imports: [CommonModule],
  declarations: [NgbTimepicker],
  providers: [
    { provide: NgbTimeAdapter, useFactory: NGB_TIMEPICKER_TIME_ADAPTER_FACTORY },
    { provide: NgbTimepickerI18n, useClass: NgbTimepickerI18nDefault },
  ],
})
export class NgbTimepickerModule {}
