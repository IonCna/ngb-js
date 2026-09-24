import { NgbToast } from "@ngb/toast/ngb-toast.component";
import { NgbToastHeader } from "@ngb/toast/ngb-toast-header.directive";
import { NgModule } from "ngjs-core";
import { CommonModule } from "ngjs-core/common";

@NgModule({
  imports: [CommonModule],
  declarations: [NgbToast, NgbToastHeader],
})
export class NgbToastModule {}
