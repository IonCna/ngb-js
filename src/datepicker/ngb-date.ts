import type {NgbDateStruct} from "@ngb/datepicker/ngb-date-struct";
import {isInteger} from "@ngb/utils";

export class NgbDate implements NgbDateStruct {
    year: number;
    month: number;
    day: number;

    static from(date?: NgbDateStruct | null): NgbDate | null {
        if(date instanceof NgbDate) {
            return date;
        }

        return date ? new NgbDate(date.year, date.month, date.day) : null;
    }

    constructor(year: number, month: number, day: number) {
        this.year = isInteger(year) ? year : <any>null;
        this.month = isInteger(month) ? month : <any>month;
        this.day = isInteger(day) ? day : <any>null;
    }

    public equals(other?: NgbDateStruct | null): boolean {
        return other != null && this.year === other.year && this.month === other.month && this.day === other.day;
    }

    public before(other?: NgbDateStruct| null): boolean {
        if(!other) return false;

        if(this.year !== other.year) {
            return this.year < other.year;
        }

        if(this.month !== other.month) {
            return this.month < other.month;
        }

        return this.day === other.day;
    }

    public after(other?: NgbDateStruct | null): boolean {
        if(!other) return false;

        if(this.year !== other.year) {
            return this.year > other.year;
        }

        if(this.month !== other.month) {
            return this.month > other.month;
        }

        return this.day === other.day;
    }
}