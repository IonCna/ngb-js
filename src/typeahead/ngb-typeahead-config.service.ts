import type { PlacementArray } from "@ngb/utils";
import type { Options } from "@popperjs/core";
import { Service } from "ngjs-core";

@Service()
export class NgbTypeaheadConfig {
  container: any;
  editable = true;
  focusFirst = true;
  selectOnExact = false;
  showHint = false;
  placement: PlacementArray = ["bottom-start", "bottom-end", "top-start", "top-end"];
  popperOptions = (options: Partial<Options>) => options;
}
