import type { IFilterService } from "angular";
import { inject, Injectable } from "ngjs-core";

/**
 * Type of the service supplying day periods (for example, 'AM' and 'PM') to NgbTimepicker component.
 * The default implementation of this service honors the Angular locale, and uses the registered locale data,
 * as explained in the Angular i18n guide.
 */
@Injectable({ providedIn: "root" })
export abstract class NgbTimepickerI18n {
  /**
   * Returns the name for the period before midday.
   */
  abstract getMorningPeriod(): string;

  /**
   * Returns the name for the period after midday.
   */
  abstract getAfternoonPeriod(): string;
}

/**
 * A service providing default implementation for the timepicker i18n.
 *
 * ngjs-core: upstream usa `inject(LOCALE_ID)` + `formatDate` de `@angular/common`.
 * Ninguno está provisto en un módulo suelto acá, así que se resuelve `$filter`
 * de AngularJS (equivalente funcional). Ver `NgbDatepickerI18nDefault`.
 */
@Injectable()
export class NgbTimepickerI18nDefault extends NgbTimepickerI18n {
  private readonly _periods: string[];

  // upstream: sin constructor (`inject(LOCALE_ID)` en field). Acá se acepta un
  // `$filter` opcional para el uso `new NgbTimepickerI18nDefault()` fuera de un
  // contexto DI (stubs de test).
  constructor($filter?: IFilterService) {
    super();

    const dateFilter = ($filter ?? inject<IFilterService>("$filter"))("date");
    this._periods = [
      dateFilter(new Date(3_600_000), "a", "UTC"),
      dateFilter(new Date(3_600_000 * 13), "a", "UTC"),
    ];
  }

  getMorningPeriod(): string {
    return this._periods[0];
  }

  getAfternoonPeriod(): string {
    return this._periods[1];
  }
}
