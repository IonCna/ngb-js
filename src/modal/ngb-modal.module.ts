import { NgbModalBackdrop } from "@ngb/modal/ngb-modal-backdrop.component";
import { NgbModalWindow } from "@ngb/modal/ngb-modal-window.component";
import { NgbScrollbar } from "@ngb/ngb-scrollbar.service";
import { NgModule } from "ngjs-core";
import { CommonModule } from "ngjs-core/common";

export { NgbModal } from "@ngb/modal/ngb-modal.service";
export {
  NgbModalConfig,
  type NgbModalOptions,
  type NgbModalUpdatableOptions,
} from "@ngb/modal/ngb-modal-config.service";
export { ModalDismissReasons } from "@ngb/modal/ngb-modal-dismiss-reasons";
export { NgbActiveModal, NgbModalRef } from "@ngb/modal/ngb-modal-ref";

@NgModule({
  imports: [CommonModule],
  declarations: [NgbModalWindow, NgbModalBackdrop],
  providers: [NgbScrollbar],
})
export class NgbModalModule {}
