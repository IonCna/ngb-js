import type {IFilterDate} from "angular";

export abstract class NgbTimepickerI18n {
    abstract getMorningPeriod(): string;
    abstract getAfternoonPeriod(): string;

    static get $name() {
        return "ngb.timepicker.i18n";
    }
}

export class NgbTimepickerI18nDefault extends NgbTimepickerI18n {
    private readonly periods: string[] = []

    constructor(dateFilter: IFilterDate) {
        super();

        this.periods = [
            dateFilter(new Date(3_600_000), "a", "UTC"),
            dateFilter(new Date(3_600_000 * 13), "a", "UTC"),
        ];
    }

    getMorningPeriod(): string {
        return this.periods[0]
    }

    getAfternoonPeriod(): string {
        return this.periods[1]
    }

    static get $inject() {
        return ["dateFilter"];
    }
}