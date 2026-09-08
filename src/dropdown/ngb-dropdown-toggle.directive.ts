import { NgbDropdownAnchor } from "@ngb/dropdown/ngb-dropdown-anchor.directive";
import { Directive, HostListener } from "ngjs-core";

/**
 * Marca el elemento que abre/cierra el dropdown con el evento `click`.
 * `NgbDropdownAnchor` es la alternativa sin `click`.
 */
@Directive({ selector: "[ngbDropdownToggle]" })
export class NgbDropdownToggle extends NgbDropdownAnchor {
  @HostListener("click")
  _onClick(): void {
    this.dropdown.toggle();
  }

  @HostListener("keydown.arrowup", ["$event"])
  @HostListener("keydown.arrowdown", ["$event"])
  @HostListener("keydown.home", ["$event"])
  @HostListener("keydown.end", ["$event"])
  @HostListener("keydown.tab", ["$event"])
  @HostListener("keydown.shift.tab", ["$event"])
  _onKeyDown(event: KeyboardEvent): void {
    this.dropdown.onKeyDown(event as unknown as JQueryEventObject);
  }
}
