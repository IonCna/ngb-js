import type { NgbScrollSpyProcessChanges } from "@ngb/scrollspy/scrollspy.service";
import { defaultProcessChanges } from "@ngb/scrollspy/scrollspy.utils";
import { Service } from "ngjs-core";

@Service({ id: "ngb.scrollspy.config.service" })
export class NgbScrollSpyConfig {
  scrollBehavior: "auto" | "smooth" = "smooth";
  processChanges: NgbScrollSpyProcessChanges = defaultProcessChanges;
}
