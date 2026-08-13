import type { NgbDateStruct } from "@ngb/datepicker/ngb-date-struct.ts";
import type { IFilterService, ILocaleService } from "angular";

export abstract class NgbDatepickerI18n {
  abstract getWeekdayLabel(weekday: number, width?: Exclude<Intl.DateTimeFormatOptions["weekday"], undefined>): string;
  abstract getMonthShortName(month: number, year?: number): string;
  abstract getMonthFullName(month: number, year?: number): string;

  getMonthLabel(date: NgbDateStruct): string {
    return `${this.getMonthFullName(date.month, date.year)} ${this.getYearNumerals(date.year)}`;
  }

  abstract getDayAriaLabel(date: NgbDateStruct): string;

  getDayNumerals(date: NgbDateStruct): string {
    return `${date.day}`;
  }

  getWeekNumerals(weekNumber: number): string {
    return `${weekNumber}`;
  }

  getYearNumerals(year: number): string {
    return `${year}`;
  }

  getWeekLabel(): string {
    return "";
  }
}

export class NgbDatepickerI18nDefault extends NgbDatepickerI18n {
  private readonly _monthsShort: string[];
  private readonly _monthsFull: string[];

  constructor(
    private $locale: ILocaleService,
    private $filter: IFilterService,
  ) {
    super();
    this._monthsShort = Array.from({ length: 12 }, (_, month) =>
      Intl.DateTimeFormat(this.$locale.id, { month: "short", timeZone: "UTC" }).format(Date.UTC(2000, month)),
    );
    this._monthsFull = Array.from({ length: 12 }, (_, month) =>
      Intl.DateTimeFormat(this.$locale.id, { month: "long", timeZone: "UTC" }).format(Date.UTC(2000, month)),
    );
  }

  public getWeekdayLabel(weekday: number, width: Exclude<Intl.DateTimeFormatOptions["weekday"], undefined> = "narrow") {
    // 1 May 2000 was a Monday; datepicker weekdays use 1 (Mon) to 7 (Sun).
    const weekdays = [1, 2, 3, 4, 5, 6, 7].map((day) =>
      Intl.DateTimeFormat(this.$locale.id, { weekday: width, timeZone: "UTC" }).format(Date.UTC(2000, 4, day)),
    );
    return weekdays[weekday - 1] || "";
  }

  getMonthShortName(month: number): string {
    return this._monthsShort[month - 1] || "";
  }

  getMonthFullName(month: number): string {
    return this._monthsFull[month - 1] || "";
  }

  getDayAriaLabel(date: NgbDateStruct): string {
    const jsDate = new Date(date.year, date.month - 1, date.day);
    const dateFilter = this.$filter("date");

    return dateFilter(jsDate, "fullDate");
  }
}
