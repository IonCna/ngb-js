import type { ITranscludeFunction } from "angular";
import type { NgbDateStruct } from "@/datepicker/ngb-date-struct";

export class NgbDatepickerConfig {
	public showWeekNumbers = false;
	public outsideDays: "visible" | "collapsed" | "hidden" = "visible";
	public navigation: "select" | "arrows" | "none" = "select";
	public displayMonths = 1;
	public firstDayOfWeek = 1;

	public minDate?: NgbDateStruct;
	public maxDate?: NgbDateStruct;

	public startDate?: { year: number; month: number; day?: number };
	public weekdays:
		| Exclude<Intl.DateTimeFormatOptions["weekday"], undefined>
		| boolean = "narrow";

	public dayTemplateData?: (
		date: NgbDateStruct,
		current?: { year: number; month: number },
	) => any;
	public markDisabled?: (
		date: NgbDateStruct,
		current?: { year: number; month: number },
	) => boolean;

	dayTemplate?: ITranscludeFunction;
	footerTemplate?: ITranscludeFunction;

	static get $name() {
		return "ngb.datepicker.config.service";
	}
}
