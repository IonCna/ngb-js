import { NgbScrollSpy } from "@ngb/scrollspy/ngb-scrollspy.directive";
import { NgbScrollSpyFragment } from "@ngb/scrollspy/ngb-scrollspy-fragment.directive";
import { NgbScrollSpyItem } from "@ngb/scrollspy/ngb-scrollspy-item.directive";
import { NgbScrollSpyMenu } from "@ngb/scrollspy/ngb-scrollspy-menu.directive";
import { NgModule } from "ngjs-core";

@NgModule({
  declarations: [NgbScrollSpy, NgbScrollSpyItem, NgbScrollSpyFragment, NgbScrollSpyMenu],
})
export class NgbScrollSpyModule {}
