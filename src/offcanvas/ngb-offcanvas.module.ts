import { NgbScrollbar } from "@ngb/ngb-scrollbar.service";
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
export { OffcanvasDismissReasons } from "@ngb/offcanvas/ngb-offcanvas-dismiss-reasons";
export { NgbActiveOffcanvas, NgbOffcanvasRef } from "@ngb/offcanvas/ngb-offcanvas-ref";

@NgModule({
  imports: [CommonModule],
  declarations: [NgbOffcanvasPanel, NgbOffcanvasBackdrop],
  providers: [NgbScrollbar],
})
export class NgbOffcanvasModule {}
