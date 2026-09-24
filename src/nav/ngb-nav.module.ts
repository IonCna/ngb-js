import { NgbNav } from "@ngb/nav/ngb-nav.directive";
import { NgbNavContent } from "@ngb/nav/ngb-nav-content.directive";
import { NgbNavItem } from "@ngb/nav/ngb-nav-item.directive";
import { NgbNavLinkBase } from "@ngb/nav/ngb-nav-link-base.directive";
import { NgbNavOutlet } from "@ngb/nav/ngb-nav-outlet.directive";
import { NgbNavPane } from "@ngb/nav/ngb-nav-pane.directive";
import { NgModule } from "ngjs-core";
import { CommonModule } from "ngjs-core/common";

@NgModule({
  imports: [CommonModule],
  declarations: [NgbNavContent, NgbNav, NgbNavItem, NgbNavLinkBase, NgbNavOutlet, NgbNavPane],
})
export class NgbNavModule {}
