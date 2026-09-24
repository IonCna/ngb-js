import type { PlacementArray } from "@ngb/utils";
import type { Options } from "@popperjs/core";
import { Injectable } from "ngjs-core";

@Injectable({ providedIn: "root" })
export class NgbTypeaheadConfig {
  container: any;
  editable = true;
  focusFirst = true;
  selectOnExact = false;
  showHint = false;
  placement: PlacementArray = ["bottom-start", "bottom-end", "top-start", "top-end"];
  popperOptions = (options: Partial<Options>) => options;
}
