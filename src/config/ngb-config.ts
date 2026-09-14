import { Service } from "ngjs-core";

/** Global ng-bootstrap config. Paridad con `@ng-bootstrap` (`ngb-config.ts`). */
@Service({ id: "ngb.config.service" })
export class NgbConfig {
  public animation: boolean = true;
}
