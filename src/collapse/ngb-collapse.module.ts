import { NgbCollapseConfig } from "@ngb/collapse/ngb-collapse-config.service";
import { NgbCollapse } from "@ngb/collapse/ngb-collapse.directive";
import { NgModule } from "ngjs-core/runtime/core";

@NgModule({
  id: "ngb.collapse",
  declarations: [NgbCollapse],
  providers: [NgbCollapseConfig],
})
export class NgbCollapseModule {}
