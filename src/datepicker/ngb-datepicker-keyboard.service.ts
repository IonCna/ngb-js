import type { NgbDatepicker } from "@ngb/datepicker/ngb-datepicker.component";

export class NgbDatepickerKeyboardService {
  processKey(event: KeyboardEvent | JQueryEventObject, datepicker: NgbDatepicker): void {
    const { state, calendar } = datepicker;

    switch (event.key) {
      case "PageUp":
        datepicker.focusDate(calendar.getPrev(state.focusedDate, event.shiftKey ? "y" : "m", 1));
        break;
      case "PageDown":
        datepicker.focusDate(calendar.getNext(state.focusedDate, event.shiftKey ? "y" : "m", 1));
        break;
      case "End":
        datepicker.focusDate(event.shiftKey ? state.maxDate : state.lastDate);
        break;
      case "Home":
        datepicker.focusDate(event.shiftKey ? state.minDate : state.firstDate);
        break;
      case "ArrowLeft":
        datepicker.focusDate(calendar.getPrev(state.focusedDate, "d", 1));
        break;
      case "ArrowUp":
        datepicker.focusDate(calendar.getPrev(state.focusedDate, "d", calendar.getDaysPerWeek()));
        break;
      case "ArrowRight":
        datepicker.focusDate(calendar.getNext(state.focusedDate, "d", 1));
        break;
      case "ArrowDown":
        datepicker.focusDate(calendar.getNext(state.focusedDate, "d", calendar.getDaysPerWeek()));
        break;
      case "Enter":
      case " ":
        datepicker.focusSelect();
        break;
      default:
        return;
    }

    event.preventDefault();
    event.stopPropagation();
  }

  static get $name() {
    return "ngb.datepicker.keyboard.service";
  }
}
