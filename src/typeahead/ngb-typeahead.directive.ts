import type { NgbTypeaheadSelectItemEvent } from "@ngb/typeahead/ngb-typeahead-select-item-event.model";
import type { ResultTemplateContext } from "@ngb/typeahead/ngb-result-template-context.model";
import type { IController, IDirective } from "angular";
import type { TemplateRef } from "ngjs-core";

export class NgbTypeahead implements IController {
  protected autocomplete?: string;
  protected container?: any;
  protected editable?: boolean;
  protected focusFirst?: boolean;
  protected inputFormatter?: (item: any) => string;
  protected ngbTypeahead?: unknown;
  protected placement?: unknown;
  protected popperOptions?: unknown;
  protected popupClass?: string;
  protected resultFormatter?: (item: any) => string;
  protected resultTemplate?: TemplateRef<ResultTemplateContext>;
  protected selectOnExact?: boolean;
  protected showHint?: boolean;
  protected selectItem?: NgbTypeaheadSelectItemEvent;

  static get $name() {
    return "ngbTypeahead";
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
        selectItem: "&?",
      },
      bindToController: true,
      controller: NgbTypeahead,
    });
  }
}
