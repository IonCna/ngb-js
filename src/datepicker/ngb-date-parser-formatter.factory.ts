import angular from "angular";
import type { NgbDateStruct } from "@ngb/datepicker/adapters/ngb-date-adapter.factory";
import { isNumber, padNumber, toInteger } from "@ngb/utils";

export function NGB_DATEPICKER_PARSER_FORMATTER_FACTORY() {
  return new NgbDateISOParserFormatter();
}

export abstract class NgbDateParserFormatter {
  abstract parse(value: string): NgbDateStruct | null;
  abstract format(date: NgbDateStruct | null): string;
}

export class NgbDateISOParserFormatter extends NgbDateParserFormatter {
  parse(value: string): NgbDateStruct | null {
    if (value == null) return null;

    const dateParts = value.trim().split("-");
    const chunks: Record<number, () => NgbDateStruct | null> = {
      1: () => {
        const [year] = dateParts;
        const valid = isNumber(year);

        if (!valid) return null;

        return {
          year: toInteger(year),
          month: <any>null,
          day: <any>null,
        };
      },
      2: () => {
        const [year, month] = dateParts;
        const valid = isNumber(year) && isNumber(month);

        if (!valid) return null;

        return {
          year: toInteger(year),
          month: toInteger(month),
          day: <any>null,
        };
      },
      3: () => {
        const [year, month, day] = dateParts;
        const valid = isNumber(year) && isNumber(month) && isNumber(day);

        if (!valid) return null;

        return {
          year: toInteger(year),
          month: toInteger(month),
          day: toInteger(day),
        };
      },
    };

    const chunk = chunks[dateParts.length];
    return chunk();
  }

  format(date: NgbDateStruct | null): string {
    return date
      ? `${date.year}-${angular.isNumber(date.month) ? padNumber(date.month) : ""}-${angular.isNumber(date.day) ? padNumber(date.day) : ""}`
      : "";
  }
}
