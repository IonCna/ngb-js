import type {NgbDate} from "@ngb/datepicker/ngb-date.ts";
import type {NgbDayTemplateData, NgbMarkDisabled} from "@ngb/datepicker/ngb-datepicker-view-model";

export type DatepickerServiceInputs = Partial<{
    dayTemplateData: NgbDayTemplateData;
    displayMonths: number;
    disabled: boolean;
    firstDayOfWeek: number;
    focusVisible: boolean;
    markDisabled: NgbMarkDisabled;
    maxDate: NgbDate | null;
    minDate: NgbDate | null;
    navigation: 'select' | 'arrows' | 'none';
    outsideDays: 'visible' | 'collapsed' | 'hidden';
    weekdays: Exclude<Intl.DateTimeFormatOptions['weekday'], undefined> | boolean;
}>;

export class NgbDatepickerService {

}

