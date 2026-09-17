import { NgbModalBackdrop } from "@ngb/modal/ngb-modal-backdrop.component";
import { NgbModalWindow } from "@ngb/modal/ngb-modal-window.component";
import { NgModule } from "ngjs-core";
import { CommonModule } from "ngjs-core/common";
import { NgbScrollbar } from "@ngb/ngb-scrollbar.service";

export { NgbModal } from "@ngb/modal/ngb-modal.service";
export {
  NgbModalConfig,
  type NgbModalOptions,
  type NgbModalUpdatableOptions,
} from "@ngb/modal/ngb-modal-config.service";
export { ModalDismissReasons } from "@ngb/modal/ngb-modal-dismiss-reasons";
export { NgbActiveModal, NgbModalRef } from "@ngb/modal/ngb-modal-ref";

// `NgbModal`/`NgbModalConfig` son `@Service()` → se auto-registran, no van en
// `providers`. `NgbModalStack` es interno en ng-bootstrap → no se publica.
@NgModule({
  id: "ngb.modal",
  imports: [CommonModule],
  declarations: [NgbModalWindow, NgbModalBackdrop],
  providers: [NgbScrollbar],
})
export class NgbModalModule {}
