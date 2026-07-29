import type { NgbTimeStruct } from "@ngb/timepicker/ngb-timepicker-struct.ts";
import { isInteger } from "@ngb/utils";

export abstract class NgbTimeAdapter<T> {
  abstract fromModel(value: T | null): NgbTimeStruct | null;
  abstract toModel(time: NgbTimeStruct | null): T | null;
}

export class NgbTimeStructAdapter extends NgbTimeAdapter<NgbTimeStruct> {
  fromModel(time: NgbTimeStruct | null): NgbTimeStruct | null {
    return time && isInteger(time.hour) && isInteger(time.minute)
      ? { hour: time.hour, minute: time.minute, second: isInteger(time.second) ? time.second : <any>null }
      : null;
  }

  toModel(time: NgbTimeStruct | null): NgbTimeStruct | null {
    return time && isInteger(time.hour) && isInteger(time.minute)
      ? { hour: time.hour, minute: time.minute, second: isInteger(time.second) ? time.second : <any>null }
      : null;
  }
}
