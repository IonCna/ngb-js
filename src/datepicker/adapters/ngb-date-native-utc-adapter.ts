import { NgbDateNativeAdapter } from "@ngb/datepicker/adapters/ngb-date-native-adapter";
import type { NgbDateStruct } from "@ngb/datepicker/ngb-date-struct";

export class NgbDateNativeUTCAdapter extends NgbDateNativeAdapter {
  protected _fromNativeDate(date: Date): NgbDateStruct {
    return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
  }

  protected _toNativeDate(date: NgbDateStruct): Date {
    const jsDate = new Date(Date.UTC(date.year, date.month - 1, date.day));
    // avoid 30 -> 1930 conversion
    jsDate.setUTCFullYear(date.year);
    return jsDate;
  }
}
