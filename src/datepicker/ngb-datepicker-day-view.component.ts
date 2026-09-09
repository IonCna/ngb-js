import { NgbDatepickerI18n } from "@ngb/datepicker/ngb-datepicker-i18n.service.ts";
import type { NgbDate } from "@ngb/datepicker/ngb-date.ts";
import { Component, HostBinding, inject, Input } from "ngjs-core";

/**
 * upstream:
 * ```
 * host: {
 *   class: 'btn-light',
 *   '[class.bg-primary]': 'selected', '[class.text-white]': 'selected',
 *   '[class.text-muted]': 'isMuted()', '[class.outside]': 'isMuted()',
 *   '[class.active]': 'focused',
 * }
 * ```
 * `styleUrl: './datepicker-day-view.scss'` de upstream → `datepicker-day-view.css`
 * (global, sin `ViewEncapsulation` — no lo soporta ngjs-core). Se incluye como
 * hoja de estilo aparte, igual que `tooltip.css`.
 */
@Component({
  selector: "[ngbDatepickerDayView]",
  controllerAs: "$",
  template: "{{ $.i18n.getDayNumerals($.date) }}",
})
export class NgbDatepickerDayView {
  i18n = inject(NgbDatepickerI18n);

  @Input() currentMonth!: number;
  @Input() date!: NgbDate;
  @Input() disabled!: boolean;
  @Input() focused!: boolean;
  @Input() selected!: boolean;

  @HostBinding("class.btn-light") readonly _btnLight = true;
  @HostBinding("class.bg-primary") get _bgPrimary() {
    return this.selected;
  }
  @HostBinding("class.text-white") get _textWhite() {
    return this.selected;
  }
  @HostBinding("class.text-muted") get _textMuted() {
    return this.isMuted();
  }
  @HostBinding("class.outside") get _outside() {
    return this.isMuted();
  }
  @HostBinding("class.active") get _active() {
    return this.focused;
  }

  isMuted() {
    return !this.selected && (this.date.month !== this.currentMonth || this.disabled);
  }
}
