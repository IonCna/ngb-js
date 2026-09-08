import { NgbAlert } from "@ngb/alert/ngb-alert.component";
import { NgbAlertConfig } from "@ngb/alert/ngb-alert-config.service";
import { CommonModule } from "ngjs-core/common";
import { NgModule } from "ngjs-core";

@NgModule({
  id: "ngb.alert",
  imports: [CommonModule],
  declarations: [NgbAlert],
  providers: [NgbAlertConfig],
})
export class NgbAlertModule {}
