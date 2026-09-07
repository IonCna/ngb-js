import { NgbScrollSpyConfig } from "@ngb/scrollspy/ngb-scrollspy-config.service";
import { NgbScrollSpyFragment } from "@ngb/scrollspy/ngb-scrollspy-fragment.directive";
import { NgbScrollSpyItem } from "@ngb/scrollspy/ngb-scrollspy-item.directive";
import { NgbScrollSpyMenu } from "@ngb/scrollspy/ngb-scrollspy-menu.directive";
import { NgbScrollSpy } from "@ngb/scrollspy/ngb-scrollspy.directive";
import { NgbScrollSpyService } from "@ngb/scrollspy/scrollspy.service";
import { NgModule } from "ngjs-core/runtime/core";

@NgModule({
  id: "ngb.scrollspy",
  declarations: [NgbScrollSpy, NgbScrollSpyFragment, NgbScrollSpyItem, NgbScrollSpyMenu],
  providers: [NgbScrollSpyConfig, NgbScrollSpyService],
})
export class NgbScrollSpyModule {}
