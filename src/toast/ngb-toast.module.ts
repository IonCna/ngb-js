import { NgbToast } from "@ngb/toast/ngb-toast.component";
import { NgbToastConfig } from "@ngb/toast/ngb-toast-config.service";
import { NgbToastHeader } from "@ngb/toast/ngb-toast-header.directive";
import { CommonModule } from "ngjs-core/runtime/common";
import { NgModule } from "ngjs-core/runtime/core";

@NgModule({
  id: "ngb.toast",
  imports: [CommonModule],
  declarations: [NgbToast, NgbToastHeader],
  providers: [NgbToastConfig],
})
export class NgbToastModule {}
