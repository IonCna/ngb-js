import { NgbOffcanvas } from "@ngb/offcanvas/ngb-offcanvas.service";
import { NgbOffcanvasBackdrop } from "@ngb/offcanvas/ngb-offcanvas-backdrop.component";
import { NgbOffcanvasConfig } from "@ngb/offcanvas/ngb-offcanvas-config.service";
import { NgbOffcanvasPanel } from "@ngb/offcanvas/ngb-offcanvas-panel.component";
import { NGB_OFFCANVAS, NGB_OFFCANVAS_CONFIG } from "@ngb/offcanvas/tokens";
import { inject, NgModule } from "ngjs-core";
import { CommonModule } from "ngjs-core/common";

export { NgbOffcanvas } from "@ngb/offcanvas/ngb-offcanvas.service";
export {
  NgbOffcanvasConfig,
  type NgbOffcanvasOptions,
  type NgbOffcanvasUpdatableOptions,
} from "@ngb/offcanvas/ngb-offcanvas-config.service";
export { OffcanvasDismissReasons } from "@ngb/offcanvas/ngb-offcanvas-dismiss-reasons";
export { NgbActiveOffcanvas, NgbOffcanvasRef } from "@ngb/offcanvas/ngb-offcanvas-ref";

// `NgbOffcanvas` / `NgbOffcanvasConfig` son `@Service()` → se auto-registran. Los
// tokens `NGB_OFFCANVAS` / `NGB_OFFCANVAS_CONFIG` sí van en `providers`:
// `useFactory: () => inject(Clase)` los deja pedibles por string con `$inject`.
// `NgbOffcanvasStack` es interno en ng-bootstrap → no se publica.
@NgModule({
  id: "ngb.offcanvas",
  imports: [CommonModule],
  declarations: [NgbOffcanvasPanel, NgbOffcanvasBackdrop],
  providers: [
    { provide: NGB_OFFCANVAS, useFactory: () => inject(NgbOffcanvas) },
    { provide: NGB_OFFCANVAS_CONFIG, useFactory: () => inject(NgbOffcanvasConfig) },
  ],
})
export class NgbOffcanvasModule {}
