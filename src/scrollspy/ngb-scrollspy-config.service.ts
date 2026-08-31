import type { NgbScrollSpyProcessChanges } from "@ngb/scrollspy/scrollspy.service";
import { defaultProcessChanges } from "@ngb/scrollspy/scrollspy.utils";

export class NgbScrollSpyConfig {
  scrollBehavior: "auto" | "smooth" = "smooth";
  processChanges: NgbScrollSpyProcessChanges = defaultProcessChanges;

  static get $name() {
    return "ngb.scrollspy.config.service";
  }
}
