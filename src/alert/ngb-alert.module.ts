import { NgbAlert } from "@ngb/alert/ngb-alert.component";
import { NgbAlertConfig } from "@ngb/alert/ngb-alert-config.service";
import { CommonModule } from "ngjs-core/runtime/common";
import { NgModule } from "ngjs-core/runtime/core";

@NgModule({
  id: "ngb.alert",
  imports: [CommonModule],
  declarations: [NgbAlert],
  providers: [NgbAlertConfig],
})
export class NgbAlertModule {}
