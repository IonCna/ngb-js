import { isInteger } from "@/utils";

export interface NgbDateStruct {
    year: number;
    month: number;
    day: number;
}

export abstract class NgbDateAdapter<D> {
    abstract fromModel(value: D | null): NgbDateStruct | null;
    abstract toModel(date: NgbDateStruct | null): D | null;
}

export class NgbDateStructAdapter extends NgbDateAdapter<NgbDateStruct> {
    fromModel(date: NgbDateStruct | null): NgbDateStruct | null {
        return date && isInteger(date.year) && isInteger(date.month) && isInteger(date.day)
            ? { year: date.year, month: date.month, day: date.day }
            : null;
    }

    toModel(date: NgbDateStruct | null): NgbDateStruct | null {
        return date && isInteger(date.year) && isInteger(date.month) && isInteger(date.day)
            ? { year: date.year, month: date.month, day: date.day }
            : null;
    }
}

export function NGB_DATEPICKER_DATE_ADAPTER_FACTORY() {
	return new NgbDateStructAdapter();
}