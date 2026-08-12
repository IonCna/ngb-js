import type {NgbDateStruct} from "@ngb/datepicker/ngb-date-struct";
import {isInteger} from "@ngb/utils";

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