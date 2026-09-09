import { NgbModal } from "@ngb/modal/ngb-modal.service";
import { NgbModalBackdrop } from "@ngb/modal/ngb-modal-backdrop.component";
import { NgbModalConfig } from "@ngb/modal/ngb-modal-config.service";
import { NgbModalWindow } from "@ngb/modal/ngb-modal-window.component";
import { NGB_MODAL, NGB_MODAL_CONFIG } from "@ngb/modal/tokens";
import { inject, NgModule } from "ngjs-core";
import { CommonModule } from "ngjs-core/common";

export { NgbModal } from "@ngb/modal/ngb-modal.service";
export {
  NgbModalConfig,
  type NgbModalOptions,
  type NgbModalUpdatableOptions,
} from "@ngb/modal/ngb-modal-config.service";
export { ModalDismissReasons } from "@ngb/modal/ngb-modal-dismiss-reasons";
export { NgbActiveModal, NgbModalRef } from "@ngb/modal/ngb-modal-ref";

// `NgbModal`/`NgbModalConfig` son `@Service()` → se auto-registran. Los tokens
// `NGB_MODAL` / `NGB_MODAL_CONFIG` sí van en `providers`: `useFactory: () =>
// inject(Clase)` los deja pedibles por string con `$inject` (misma instancia
// singleton). `NgbModalStack` es interno en ng-bootstrap → no se publica.
@NgModule({
  id: "ngb.modal",
  imports: [CommonModule],
  declarations: [NgbModalWindow, NgbModalBackdrop],
  providers: [
    { provide: NGB_MODAL, useFactory: () => inject(NgbModal) },
    { provide: NGB_MODAL_CONFIG, useFactory: () => inject(NgbModalConfig) },
  ],
})
export class NgbModalModule {}
