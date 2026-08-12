import type {NgbDatepicker} from "@ngb/datepicker/ngb-datepicker.component";

export class NgbDatepickerKeyboardService {
    processKey(event: KeyboardEvent, datepicker: NgbDatepicker) {
        const { state, calendar } = datepicker;

        const focus = () => {

        }

        const cases = {
            PageUp: () => {},
            PageDown: () => {},
            End: () => {},
            Home: () => {},
            ArrowLeft: () => {},
            ArrowUp: () => {},
            ArrowRight: () => {},
            ArrowDown: () => {},
            Enter: () => focus(),
            [" "]: () => focus()
        }

        event.preventDefault();
        event.stopPropagation();
    }

    static get $name() {
        return 'ngb.datepicker.Keyboard.service';
    }
}