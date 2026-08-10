import type {PlacementArray} from "@ngb/utils/positioning.ts";
import type {Options} from "@popperjs/core";

export class NgbTypeaheadConfig {
  public container: unknown;
  public editable = true
  public focusFirst = true
  public selectOnExact = false
  public showHint = false;
  public placement: PlacementArray = ['bottom-start', 'bottom-end', 'top-start', 'top-end'];
  public popperOptions = (options: Partial<Options>) => options;

  static get $name() {
    return "ngb.typeahead.config.service";
  }
}
