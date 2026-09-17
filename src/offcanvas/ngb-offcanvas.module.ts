import { NgbOffcanvasBackdrop } from "@ngb/offcanvas/ngb-offcanvas-backdrop.component";
import { NgbOffcanvasPanel } from "@ngb/offcanvas/ngb-offcanvas-panel.component";
import { NgModule } from "ngjs-core";
import { CommonModule } from "ngjs-core/common";
import { NgbScrollbar } from "@ngb/ngb-scrollbar.service";

export { NgbOffcanvas } from "@ngb/offcanvas/ngb-offcanvas.service";
export {
  NgbOffcanvasConfig,
  type NgbOffcanvasOptions,
  type NgbOffcanvasUpdatableOptions,
} from "@ngb/offcanvas/ngb-offcanvas-config.service";
export { OffcanvasDismissReasons } from "@ngb/offcanvas/ngb-offcanvas-dismiss-reasons";
export { NgbActiveOffcanvas, NgbOffcanvasRef } from "@ngb/offcanvas/ngb-offcanvas-ref";

// `NgbOffcanvas` / `NgbOffcanvasConfig` son `@Service()` → se auto-registran, no
// van en `providers`. `NgbOffcanvasStack` es interno en ng-bootstrap → no se publica.
@NgModule({
  id: "ngb.offcanvas",
  imports: [CommonModule],
  declarations: [NgbOffcanvasPanel, NgbOffcanvasBackdrop],
  providers: [NgbScrollbar],
})
export class NgbOffcanvasModule {}
