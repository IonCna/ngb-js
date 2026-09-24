import { NgbTimepicker } from "@ngb/timepicker/ngb-timepicker.component.ts";
import { NgModule } from "ngjs-core";
import { CommonModule } from "ngjs-core/common";

export { NgbTimepicker } from "@ngb/timepicker/ngb-timepicker.component.ts";
export { NgbTimeAdapter, NgbTimeStructAdapter } from "@ngb/timepicker/ngb-timepicker-adapter.service.ts";
export { NgbTimepickerConfig } from "@ngb/timepicker/ngb-timepicker-config.service.ts";
export { NgbTimepickerI18n, NgbTimepickerI18nDefault } from "@ngb/timepicker/ngb-timepicker-i18n.ts";
export type { NgbTimeStruct } from "@ngb/timepicker/ngb-timepicker-struct.ts";

@NgModule({
  controllerAs: "$",
  imports: [CommonModule],
  declarations: [NgbTimepicker],
})
export class NgbTimepickerModule {}
