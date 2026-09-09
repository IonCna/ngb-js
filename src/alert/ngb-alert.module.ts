import { NgbAlert } from "@ngb/alert/ngb-alert.component";
import { NgbAlertConfig } from "@ngb/alert/ngb-alert-config.service";
import { NGB_ALERT_CONFIG } from "@ngb/alert/tokens";
import { inject, NgModule } from "ngjs-core";
import { CommonModule } from "ngjs-core/common";

@NgModule({
  id: "ngb.alert",
  imports: [CommonModule],
  declarations: [NgbAlert],
  providers: [{ provide: NGB_ALERT_CONFIG, useFactory: () => inject(NgbAlertConfig) }],
})
export class NgbAlertModule {}
