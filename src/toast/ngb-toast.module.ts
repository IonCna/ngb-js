import { NgbToast } from "@ngb/toast/ngb-toast.component";
import { NgbToastHeader } from "@ngb/toast/ngb-toast-header.directive";
import { CommonModule } from "ngjs-core/common";
import { NgModule } from "ngjs-core";

@NgModule({
  id: "ngb.toast",
  imports: [CommonModule],
  declarations: [NgbToast, NgbToastHeader],
})
export class NgbToastModule {}
