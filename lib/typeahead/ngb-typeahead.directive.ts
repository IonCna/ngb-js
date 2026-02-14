import type { IController, IDirective } from "angular";
import type { NgbTypeaheadSelectItemEvent } from "@/typeahead/ngb-typeahead-select-item-event.model"

export class NgbTypeahead implements IController {
    protected autocomplete?: string
    protected container?: any
    protected editable?: boolean
    protected focusFirst?: boolean
    protected inputFormatter?: (item: any) => string
    protected ngbTypeahead?: unknown
    protected placement?: unknown
    protected popperOptions?: unknown
    protected popupClass?: string
    protected resultFormatter?: (item: any) => string
    protected resultTemplate?: HTMLTemplateElement
    protected selectOnExact?: boolean
    protected showHint?: boolean
    protected selectItem?: NgbTypeaheadSelectItemEvent

    static get $name() {
        return ""
    }

    static get $factory(): () => IDirective {
        return () => ({
            scope: {
                autocomplete: "<?",
                container: "<?",
                editable: "<?",
                focusFirst: "<?",
                inputFormatter: "<?",
                ngbTypeahead: "<?",
                placement: "<?",
                popperOptions: "<?",
                popupClass: "<?",
                resultFormatter: "<?",
                resultTemplate: "<?",
                selectOnExact: "<?",
                showHint: "<?",
                selectItem: "&?"
            },
            bindToController: true,
            controller: NgbTypeahead
        })
    }
}