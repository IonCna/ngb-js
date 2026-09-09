import { NgbScrollSpy } from "@ngb/scrollspy/ngb-scrollspy.directive";
import { NgbScrollSpyConfig } from "@ngb/scrollspy/ngb-scrollspy-config.service";
import { NgbScrollSpyFragment } from "@ngb/scrollspy/ngb-scrollspy-fragment.directive";
import { NgbScrollSpyItem } from "@ngb/scrollspy/ngb-scrollspy-item.directive";
import { NgbScrollSpyMenu } from "@ngb/scrollspy/ngb-scrollspy-menu.directive";
import { NgbScrollSpyService } from "@ngb/scrollspy/scrollspy.service";
import { NGB_SCROLLSPY_CONFIG } from "@ngb/scrollspy/tokens";
import { inject, NgModule } from "ngjs-core";

@NgModule({
  id: "ngb.scrollspy",
  declarations: [NgbScrollSpy, NgbScrollSpyFragment, NgbScrollSpyItem, NgbScrollSpyMenu],
  providers: [{ provide: NGB_SCROLLSPY_CONFIG, useFactory: () => inject(NgbScrollSpyConfig) }, NgbScrollSpyService],
})
export class NgbScrollSpyModule {}
