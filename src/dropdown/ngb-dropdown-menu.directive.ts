import { NgbDropdown } from "@ngb/dropdown/ngb-dropdown.directive";
import { NgbDropdownItem } from "@ngb/dropdown/ngb-dropdown-item.directive";
import { ContentChildren, Directive, ElementRef, HostBinding, HostListener, inject, type QueryList } from "ngjs-core";

/**
 * Envuelve el contenido del menú del dropdown y sus ítems.
 */
@Directive({ selector: "[ngbDropdownMenu]" })
export class NgbDropdownMenu {
  dropdown = inject(NgbDropdown);
  nativeElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  @ContentChildren(NgbDropdownItem)
  menuItems!: QueryList<NgbDropdownItem>;

  @HostBinding("class.dropdown-menu")
  readonly _dropdownMenuClass = true;

  @HostBinding("class.show")
  get _show(): boolean {
    return this.dropdown.isOpen();
  }

  @HostListener("keydown.arrowup", ["$event"])
  @HostListener("keydown.arrowdown", ["$event"])
  @HostListener("keydown.home", ["$event"])
  @HostListener("keydown.end", ["$event"])
  @HostListener("keydown.enter", ["$event"])
  @HostListener("keydown.space", ["$event"])
  @HostListener("keydown.tab", ["$event"])
  @HostListener("keydown.shift.tab", ["$event"])
  _onKeyDown(event: KeyboardEvent): void {
    this.dropdown.onKeyDown(event as unknown as JQueryEventObject);
  }
}
