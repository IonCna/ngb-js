import { NgbToast } from "@ngb/toast/ngb-toast.component";
import { NgbToastConfig } from "@ngb/toast/ngb-toast-config.service";
import { NgbToastHeader } from "@ngb/toast/ngb-toast-header.directive";
import { NGB_TOAST_CONFIG } from "@ngb/toast/tokens";
import { inject, NgModule } from "ngjs-core";
import { CommonModule } from "ngjs-core/common";

@NgModule({
  id: "ngb.toast",
  imports: [CommonModule],
  declarations: [NgbToast, NgbToastHeader],
  providers: [{ provide: NGB_TOAST_CONFIG, useFactory: () => inject(NgbToastConfig) }],
})
export class NgbToastModule {}
