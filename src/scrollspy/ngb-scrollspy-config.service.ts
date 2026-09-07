import type { NgbScrollSpyProcessChanges } from "@ngb/scrollspy/scrollspy.service";
import { defaultProcessChanges } from "@ngb/scrollspy/scrollspy.utils";
import { Injectable } from "ngjs-core";

@Injectable({ providedIn: "root" })
export class NgbScrollSpyConfig {
  scrollBehavior: "auto" | "smooth" = "smooth";
  processChanges: NgbScrollSpyProcessChanges = defaultProcessChanges;
}
