import template from "@demo/features/demo-datepicker/demo-datepicker.component.html";
import type { NgbDateStruct } from "@ngb/datepicker/ngb-date-struct.ts";
import type { DayTemplateContext } from "@ngb/datepicker/ngb-datepicker-day-template-context.ts";
import type { IComponentController, IComponentOptions } from "angular";
import { TemplateRef, ViewChild } from "ngjs-core";

export class DemoDatepicker implements IComponentController {
  public inlineDate: NgbDateStruct = { year: 2026, month: 8, day: 13 };
  public popupDate: NgbDateStruct = { year: 2026, month: 8, day: 13 };
  public minDate: NgbDateStruct = { year: 2026, month: 8, day: 1 };
  public maxDate: NgbDateStruct = { year: 2026, month: 9, day: 30 };

  @ViewChild("customDay", { read: TemplateRef, static: true })
  public customDay!: TemplateRef<DayTemplateContext>;

  public markWeekend(date: NgbDateStruct): boolean {
    const day = new Date(date.year, date.month - 1, date.day).getDay();
    return day === 0 || day === 6;
  }

  static get $name() {
    return "ngbDemoDatepicker";
  }

  static get $factory(): IComponentOptions {
    return {
      controller: DemoDatepicker,
      controllerAs: "$",
      template,
    };
  }
}
