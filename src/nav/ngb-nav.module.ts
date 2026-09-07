import { NgbNav } from "@ngb/nav/ngb-nav.directive";
import { NgbNavConfig } from "@ngb/nav/ngb-nav-config.service";
import { NgbNavContent } from "@ngb/nav/ngb-nav-content.directive";
import { NgbNavCounterFactory } from "@ngb/nav/ngb-nav-counter.factory";
import { NgbNavItem } from "@ngb/nav/ngb-nav-item.directive";
import { NgbNavItemRole } from "@ngb/nav/ngb-nav-item-role.directive";
import { NgbNavLink } from "@ngb/nav/ngb-nav-link.directive";
import { NgbNavLinkButton } from "@ngb/nav/ngb-nav-link-button.directive";
import { NgbNavOutlet } from "@ngb/nav/ngb-nav-outlet.directive";
import { NgbNavPane } from "@ngb/nav/ngb-nav-pane.directive";
import angular, {type IModule} from "angular";
import { CommonModule } from "ngjs-core/runtime/common";

export const NgbNavModule: IModule = angular.module("ngb.nav", [CommonModule.name]);

NgbNavModule.factory(NgbNavCounterFactory.$name, NgbNavCounterFactory.$factory);
NgbNavModule.directive(NgbNav.$name, NgbNav.$factory);
NgbNavModule.service(NgbNavConfig.$name, NgbNavConfig);
NgbNavModule.directive(NgbNavLinkButton.$name, NgbNavLinkButton.$factory);
NgbNavModule.directive(NgbNavContent.$name, NgbNavContent.$factory);
NgbNavModule.directive(NgbNavItem.$name, NgbNavItem.$factory);
NgbNavModule.directive(NgbNavItemRole.$name, NgbNavItemRole.$factory);
NgbNavModule.directive(NgbNavOutlet.$name, NgbNavOutlet.$factory);
NgbNavModule.directive(NgbNavLink.$name, NgbNavLink.$factory);
NgbNavModule.directive(NgbNavPane.$name, NgbNavPane.$factory);
