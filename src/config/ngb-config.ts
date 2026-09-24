import { environment } from "@ngb/environment";
import { Injectable } from "ngjs-core";

/** Global ng-bootstrap config. Paridad con `@ng-bootstrap` (`ngb-config.ts`). */
@Injectable({ providedIn: "root" })
export class NgbConfig {
  public animation: boolean = environment.animation;
}
