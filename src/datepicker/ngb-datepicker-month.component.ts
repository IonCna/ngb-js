import type { NgbDateStruct } from "@ngb/datepicker/ngb-date-struct.ts";
import { NgbDatepicker } from "@ngb/datepicker/ngb-datepicker.component.ts";
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
  template: `<div
  ng-if="$.viewModel.weekdays.length"
  class="ngb-dp-week ngb-dp-weekdays d-flex rounded-0 border-bottom bg-body-tertiary"
  role="row">
  <div
    ng-if="$.datepicker.showWeekNumbers"
    class="ngb-dp-weekday ngb-dp-showweek small fst-italic text-center"
    ng-class="{ 'text-muted': $.datepicker.model.disabled }"
    style="width: 2rem; height: 2rem; line-height: 2rem">
    {{ $.datepicker.i18n.getWeekLabel() }}
  </div>
  <div
    ng-repeat="weekday in $.viewModel.weekdays track by $index"
    class="ngb-dp-weekday small fst-italic text-center text-info"
    ng-class="{ 'text-muted': $.datepicker.model.disabled }"
    style="width: 2rem; height: 2rem; line-height: 2rem"
    role="columnheader">
    {{ weekday }}
  </div>
</div>

<div
  ng-repeat="week in $.viewModel.weeks track by $index"
  ng-if="!week.collapsed"
  class="ngb-dp-week d-flex rounded-1"
  ng-class="{ 'pb-1': $last }"
  role="row">
  <div
    ng-if="$.datepicker.showWeekNumbers"
    class="ngb-dp-week-number small text-muted fst-italic text-center"
    style="width: 2rem; height: 2rem; line-height: 2rem">
    {{ $.datepicker.i18n.getWeekNumerals(week.number) }}
  </div>
  <div
    ng-repeat="day in week.days track by day.date.year + '-' + day.date.month + '-' + day.date.day"
    ng-click="$.doSelect(day); $event.preventDefault()"
    class="ngb-dp-day"
    style="width: 2rem; height: 2rem; cursor: pointer"
    ng-style="{ cursor: day.context.disabled || day.hidden ? 'default' : 'pointer' }"
    ng-class="{ disabled: day.context.disabled, hidden: day.hidden, invisible: day.hidden, 'pe-none': day.context.disabled || day.hidden, 'z-1': day.tabindex === 0, 'ngb-dp-today': day.context.today }"
    role="gridcell"
    ng-attr-tabindex="{{ day.tabindex }}"
    ng-attr-aria-label="{{ day.ariaLabel }}"
    ng-attr-aria-disabled="{{ day.context.disabled }}"
    ng-attr-aria-selected="{{ day.context.selected }}">
    <ng-template
      ng-if="!day.hidden"
      ng-template-outlet="$.datepicker.dayTemplate"
      ng-template-outlet-context="day.context">
    </ng-template>
  </div>
</div>`,
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
