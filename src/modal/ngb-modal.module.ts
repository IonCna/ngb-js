
import { NgbModalBackdrop } from "@ngb/modal/ngb-modal-backdrop.component";
import { NgbModalWindow } from "@ngb/modal/ngb-modal-window.component";
import { NgModule } from "ngjs-core";
import { CommonModule } from "ngjs-core/common";

export { NgbModal } from "@ngb/modal/ngb-modal.service";
export {
  NgbModalConfig,
  type NgbModalOptions,
  type NgbModalUpdatableOptions,
} from "@ngb/modal/ngb-modal-config.service";
export { NgbActiveModal, NgbModalRef } from "@ngb/modal/ngb-modal-ref";
export { ModalDismissReasons } from "@ngb/modal/ngb-modal-dismiss-reasons";

// `NgbModal` es `@Service()` → se auto-registra (no va en `providers`, a
// diferencia de upstream, donde `@Service` sí se lista). Ver CORE_GAPS.
@NgModule({
  id: "ngb.modal",
  imports: [CommonModule],
  declarations: [NgbModalWindow, NgbModalBackdrop],
})
export class NgbModalModule {}
