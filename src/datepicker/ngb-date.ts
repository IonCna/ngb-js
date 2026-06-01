import type { NgbDateStruct } from "@/datepicker/adapters/ngb-date-adapter.factory";
import { isInteger } from "@/utils";

export class NgbDate implements NgbDateStruct {
  year: number;
  month: number;
  day: number;

  static from(date?: NgbDateStruct | null): NgbDate | null {
    if (date instanceof NgbDate) {
      return date;
    }
    return date ? new NgbDate(date.year, date.month, date.day) : null;
  }

  constructor(year: number, month: number, day: number) {
    this.year = isInteger(year) ? year : <any>null;
    this.month = isInteger(month) ? month : <any>null;
    this.day = isInteger(day) ? day : <any>null;
  }

  equals(other?: NgbDateStruct | null): boolean {
    return other != null && this.year === other.year && this.month === other.month && this.day === other.day;
  }

  before(other?: NgbDateStruct | null): boolean {
    if (!other) return false;
    if (this.year !== other.year) return this.year < other.year;
    if (this.month === other.month) return this.day === other.day ? false : this.day < other.day;

    return this.month < other.month;
  }

  after(other?: NgbDateStruct | null): boolean {
    if (!other) return false;
    if (this.year !== other.year) return this.year > other.year;
    if (this.month === other.month) return this.day === other.day ? false : this.day > other.day;

    return this.month > other.month;
  }
}
