import { NgbDropdown } from "@ngb/dropdown/ngb-dropdown.directive";
import { NgbDropdownAnchor } from "@ngb/dropdown/ngb-dropdown-anchor.directive";
import { NgbDropdownConfig } from "@ngb/dropdown/ngb-dropdown-config.service";
import { NgbDropdownItem } from "@ngb/dropdown/ngb-dropdown-item.directive";
import { NgbDropdownMenu } from "@ngb/dropdown/ngb-dropdown-menu.directive";
import { NgbDropdownToggle } from "@ngb/dropdown/ngb-dropdown-toggle.directive";
import { NgModule } from "ngjs-core";

@NgModule({
  id: "ngb.dropdown",
  declarations: [NgbDropdown, NgbDropdownToggle, NgbDropdownMenu, NgbDropdownItem, NgbDropdownAnchor],
  providers: [NgbDropdownConfig],
})
export class NgbDropdownModule {}
