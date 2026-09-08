import { NgbNav } from "@ngb/nav/ngb-nav.directive";
import { NgbNavConfig } from "@ngb/nav/ngb-nav-config.service";
import { NgbNavContent } from "@ngb/nav/ngb-nav-content.directive";
import { NgbNavItem } from "@ngb/nav/ngb-nav-item.directive";
import { NgbNavItemRole } from "@ngb/nav/ngb-nav-item-role.directive";
import { NgbNavLink } from "@ngb/nav/ngb-nav-link.directive";
import { NgbNavLinkBase } from "@ngb/nav/ngb-nav-link-base.directive";
import { NgbNavLinkButton } from "@ngb/nav/ngb-nav-link-button.directive";
import { NgbNavOutlet } from "@ngb/nav/ngb-nav-outlet.directive";
import { NgbNavPane } from "@ngb/nav/ngb-nav-pane.directive";
import { CommonModule } from "ngjs-core/common";
import { NgModule } from "ngjs-core";

@NgModule({
  id: "ngb.nav",
  imports: [CommonModule],
  declarations: [
    NgbNavContent,
    NgbNav,
    NgbNavItem,
    NgbNavItemRole,
    NgbNavLinkBase,
    NgbNavLinkButton,
    NgbNavLink,
    NgbNavOutlet,
    NgbNavPane,
  ],
  providers: [NgbNavConfig],
})
export class NgbNavModule {}
