import { NgbOffcanvasBackdrop } from "@ngb/offcanvas/ngb-offcanvas-backdrop.component";
import { NgbOffcanvasPanel } from "@ngb/offcanvas/ngb-offcanvas-panel.component";
import { NgModule } from "ngjs-core";
import { CommonModule } from "ngjs-core/common";

export { NgbOffcanvas } from "@ngb/offcanvas/ngb-offcanvas.service";
export {
  NgbOffcanvasConfig,
  type NgbOffcanvasOptions,
  type NgbOffcanvasUpdatableOptions,
} from "@ngb/offcanvas/ngb-offcanvas-config.service";
export { NgbActiveOffcanvas, NgbOffcanvasRef } from "@ngb/offcanvas/ngb-offcanvas-ref";
export { OffcanvasDismissReasons } from "@ngb/offcanvas/ngb-offcanvas-dismiss-reasons";

// `NgbOffcanvas` / `NgbOffcanvasStack` / `NgbOffcanvasConfig` son `@Service()` →
// se auto-registran (no van en `providers`). Ver CORE_GAPS.
@NgModule({
  id: "ngb.offcanvas",
  imports: [CommonModule],
  declarations: [NgbOffcanvasPanel, NgbOffcanvasBackdrop],
})
export class NgbOffcanvasModule {}
