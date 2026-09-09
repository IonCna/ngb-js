import { NgbCollapse } from "@ngb/collapse/ngb-collapse.directive";
import { NgbCollapseConfig } from "@ngb/collapse/ngb-collapse-config.service";
import { NGB_COLLAPSE_CONFIG } from "@ngb/collapse/tokens";
import { inject, NgModule } from "ngjs-core";

@NgModule({
  id: "ngb.collapse",
  declarations: [NgbCollapse],
  providers: [{ provide: NGB_COLLAPSE_CONFIG, useFactory: () => inject(NgbCollapseConfig) }],
})
export class NgbCollapseModule {}
