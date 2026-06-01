import { NgbDateAdapter } from "@/datepicker/adapters/ngb-date-adapter.factory";
import type { NgbDateStruct } from "@/datepicker/ngb-date-struct";
import { isInteger } from "@/utils";

export class NgbDateNativeAdapter extends NgbDateAdapter<Date> {
	fromModel(date: Date | null): NgbDateStruct | null {
		return date instanceof Date && !isNaN(date.getTime())
			? this._fromNativeDate(date)
			: null;
	}

	toModel(date: NgbDateStruct | null): Date | null {
		return date &&
			isInteger(date.year) &&
			isInteger(date.month) &&
			isInteger(date.day)
			? this._toNativeDate(date)
			: null;
	}

	protected _fromNativeDate(date: Date): NgbDateStruct {
		return {
			year: date.getFullYear(),
			month: date.getMonth() + 1,
			day: date.getDate(),
		};
	}

	protected _toNativeDate(date: NgbDateStruct): Date {
		const jsDate = new Date(date.year, date.month - 1, date.day, 12);
		// avoid 30 -> 1930 conversion
		jsDate.setFullYear(date.year);
		return jsDate;
	}

	static get $name() {
		return "ngb.date.native.adapter.service";
	}
}
