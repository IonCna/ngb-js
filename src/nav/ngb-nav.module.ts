import { NgbNav } from "@ngb/nav/ngb-nav.directive";
import { NgbNavConfig } from "@ngb/nav/ngb-nav-config.service";
import { NgbNavContent } from "@ngb/nav/ngb-nav-content.directive";
import { NgbNavItem } from "@ngb/nav/ngb-nav-item.directive";
import { NgbNavLinkBase } from "@ngb/nav/ngb-nav-link-base.directive";
import { NgbNavOutlet } from "@ngb/nav/ngb-nav-outlet.directive";
import { NgbNavPane } from "@ngb/nav/ngb-nav-pane.directive";
import { NGB_NAV_CONFIG } from "@ngb/nav/tokens";
import { inject, NgModule } from "ngjs-core";
import { CommonModule } from "ngjs-core/common";

@NgModule({
  id: "ngb.nav",
  imports: [CommonModule],
  declarations: [NgbNavContent, NgbNav, NgbNavItem, NgbNavLinkBase, NgbNavOutlet, NgbNavPane],
  providers: [{ provide: NGB_NAV_CONFIG, useFactory: () => inject(NgbNavConfig) }],
})
export class NgbNavModule {}
