import type { NgbDateStruct } from "@ngb/datepicker/ngb-date-struct.ts";
import { NgbDatepicker } from "@ngb/datepicker/ngb-datepicker.component.ts";
import template from "@ngb/datepicker/ngb-datepicker-month.component.html";
import { NgbDatepickerI18n } from "@ngb/datepicker/ngb-datepicker-i18n.service.ts";
import { NgbDatepickerKeyboardService } from "@ngb/datepicker/ngb-datepicker-keyboard.service.ts";
import { NgbDatepickerService } from "@ngb/datepicker/ngb-datepicker.service.ts";
import type { DayViewModel, MonthViewModel } from "@ngb/datepicker/ngb-datepicker-view-model.ts";
import { Component, forwardRef, HostBinding, HostListener, inject, Input } from "ngjs-core";

/**
 * A component that renders one month including all the days, weekdays and week numbers. Can be used inside
 * the `<ng-template ngbDatepickerMonths></ng-template>` when you want to customize months layout.
 *
 * @since 5.3.0
 *
 * upstream `host: { role: 'grid', '(keydown)': 'onKeyDown($event)' }`.
 */
@Component({
  selector: "ngb-datepicker-month",
  controllerAs: "$",
  template,
})
export class NgbDatepickerMonth {
  private _keyboardService = inject(NgbDatepickerKeyboardService);
  private _service = inject(NgbDatepickerService);

  i18n = inject(NgbDatepickerI18n);
  datepicker = inject<NgbDatepicker>(forwardRef(() => NgbDatepicker));

  viewModel!: MonthViewModel;

  @HostBinding("attr.role") readonly role = "grid";

  /**
   * The first date of month to be rendered.
   *
   * This month must one of the months present in the
   * [datepicker state](#/components/datepicker/api#NgbDatepickerState).
   */
  @Input()
  set month(month: NgbDateStruct) {
    this.viewModel = this._service.getMonth(month);
  }

  @HostListener("keydown", ["$event"])
  onKeyDown(event: KeyboardEvent) {
    this._keyboardService.processKey(event, this.datepicker);
  }

  doSelect(day: DayViewModel) {
    if (!day.context.disabled && !day.hidden) {
      this.datepicker.onDateSelect(day.date);
    }
  }
}
