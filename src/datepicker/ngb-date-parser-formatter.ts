import type { NgbDateStruct } from "@ngb/datepicker/ngb-date-struct";
import { isNumber, padNumber, toInteger } from "@ngb/utils";

export abstract class NgbDateParserFormatter {
  abstract parse(value: string): NgbDateStruct | null;
  abstract format(date: NgbDateStruct | null): string;
}

export class NgbDateISOParserFormatter extends NgbDateParserFormatter {
  parse(value: string): NgbDateStruct | null {
    if (value != null) {
      const dateParts = value.trim().split("-");
      if (dateParts.length === 1 && isNumber(dateParts[0])) {
        return { year: toInteger(dateParts[0]), month: <any>null, day: <any>null };
      } else if (dateParts.length === 2 && isNumber(dateParts[0]) && isNumber(dateParts[1])) {
        return { year: toInteger(dateParts[0]), month: toInteger(dateParts[1]), day: <any>null };
      } else if (dateParts.length === 3 && isNumber(dateParts[0]) && isNumber(dateParts[1]) && isNumber(dateParts[2])) {
        return { year: toInteger(dateParts[0]), month: toInteger(dateParts[1]), day: toInteger(dateParts[2]) };
      }
    }

    return null;
  }

  format(date: NgbDateStruct | null): string {
    return date
      ? `${date.year}-${isNumber(date.month) ? padNumber(date.month) : ""}-${
          isNumber(date.day) ? padNumber(date.day) : ""
        }`
      : "";
  }
}
