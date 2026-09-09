import type { NgbDateStruct } from "@ngb/datepicker/ngb-date-struct.ts";
import type { IFilterService, ILocaleService } from "angular";
import { inject, Injectable } from "ngjs-core";

/**
 * A service supplying i18n data to the datepicker component.
 *
 * The default implementation of this service uses the Angular locale and registered locale data for
 * weekdays and month names (as explained in the Angular i18n guide).
 *
 * It also provides a way to i18n data that depends on calendar calculations, like aria labels, day, week and year
 * numerals. For other static labels the datepicker uses the default Angular i18n.
 *
 * See the [i18n demo](#/components/datepicker/examples#i18n) and
 * [Hebrew calendar demo](#/components/datepicker/calendars#hebrew) on how to extend this class and define
 * a custom provider for i18n.
 *
 * ngjs-core: upstream declara `@Injectable({ providedIn: 'root', useFactory: () => new
 * NgbDatepickerI18nDefault() })`. Acá `@Injectable` no tiene `useFactory` sobre una
 * abstracta → el token lo provee `NgbDatepickerModule`
 * (`{ provide: NgbDatepickerI18n, useClass: NgbDatepickerI18nDefault }`).
 */
@Injectable({ providedIn: "root" })
export abstract class NgbDatepickerI18n {
  /**
   * Returns the weekday label using specified width
   *
   * @since 9.1.0
   */
  abstract getWeekdayLabel(weekday: number, width?: Exclude<Intl.DateTimeFormatOptions["weekday"], undefined>): string;

  /**
   * Returns the short month name to display in the date picker navigation.
   *
   * With default calendar we use ISO 8601: 'month' is 1=Jan ... 12=Dec.
   */
  abstract getMonthShortName(month: number, year?: number): string;

  /**
   * Returns the full month name to display in the date picker navigation.
   *
   * With default calendar we use ISO 8601: 'month' is 1=Jan ... 12=Dec.
   */
  abstract getMonthFullName(month: number, year?: number): string;

  /**
   * Returns the text label to display above the day view.
   *
   * @since 9.1.0
   */
  getMonthLabel(date: NgbDateStruct): string {
    return `${this.getMonthFullName(date.month, date.year)} ${this.getYearNumerals(date.year)}`;
  }

  /**
   * Returns the value of the `aria-label` attribute for a specific date.
   *
   * @since 2.0.0
   */
  abstract getDayAriaLabel(date: NgbDateStruct): string;

  /**
   * Returns the textual representation of a day that is rendered in a day cell.
   *
   * @since 3.0.0
   */
  getDayNumerals(date: NgbDateStruct): string {
    return `${date.day}`;
  }

  /**
   * Returns the textual representation of a week number rendered by datepicker.
   *
   * @since 3.0.0
   */
  getWeekNumerals(weekNumber: number): string {
    return `${weekNumber}`;
  }

  /**
   * Returns the textual representation of a year that is rendered in the datepicker year select box.
   *
   * @since 3.0.0
   */
  getYearNumerals(year: number): string {
    return `${year}`;
  }

  /**
   * Returns the week label to display in the heading of the month view.
   *
   * @since 9.1.0
   */
  getWeekLabel(): string {
    return "";
  }
}

/**
 * A service providing default implementation for the datepicker i18n.
 * It can be used as a base implementation if necessary.
 *
 * ngjs-core: upstream usa `inject(LOCALE_ID)` + `formatDate` de `@angular/common`.
 * Ninguno está provisto en un módulo suelto acá, así que se resuelve `$locale` /
 * `$filter` de AngularJS (equivalente funcional). Ver CORE_GAPS.
 *
 * @since 9.1.0
 */
@Injectable()
export class NgbDatepickerI18nDefault extends NgbDatepickerI18n {
  private _locale: ILocaleService;
  private _dateFilter: (value: any, format: string) => string;

  private _monthsShort: string[];
  private _monthsFull: string[];

  // upstream: sin constructor (`inject(LOCALE_ID)` en field). Acá se aceptan
  // `$locale` / `$filter` opcionales para el uso `new NgbDatepickerI18nDefault()`
  // fuera de un contexto DI (`NgbDatepickerService`, stubs de test).
  constructor($locale?: ILocaleService, $filter?: IFilterService) {
    super();
    this._locale = $locale ?? inject<ILocaleService>("$locale");
    this._dateFilter = ($filter ?? inject<IFilterService>("$filter"))("date");
    this._monthsShort = [...Array(12).keys()].map((month) =>
      Intl.DateTimeFormat(this._locale.id, { month: "short", timeZone: "UTC" }).format(Date.UTC(2000, month)),
    );
    this._monthsFull = [...Array(12).keys()].map((month) =>
      Intl.DateTimeFormat(this._locale.id, { month: "long", timeZone: "UTC" }).format(Date.UTC(2000, month)),
    );
  }

  getWeekdayLabel(
    weekday: number,
    width: Exclude<Intl.DateTimeFormatOptions["weekday"], undefined> = "narrow",
  ): string {
    // 1 MAY 2000 is a Monday
    const weekdays = [1, 2, 3, 4, 5, 6, 7].map((day) =>
      Intl.DateTimeFormat(this._locale.id, { weekday: width, timeZone: "UTC" }).format(Date.UTC(2000, 4, day)),
    );

    // `weekday` is 1 (Mon) to 7 (Sun)
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
    return this._dateFilter(jsDate, "fullDate");
  }
}
