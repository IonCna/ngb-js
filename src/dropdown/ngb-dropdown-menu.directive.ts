import { NgbDropdown } from "@ngb/dropdown/ngb-dropdown.directive";
import { NgbDropdownItem } from "@ngb/dropdown/ngb-dropdown-item.directive";
import {
  ContentChildren,
  Directive,
  ElementRef,
  forwardRef,
  HostBinding,
  HostListener,
  Inject,
  type QueryList,
} from "ngjs-core";

/**
 * Envuelve el contenido del menú del dropdown y sus ítems.
 */
@Directive({ selector: "[ngbDropdownMenu]" })
export class NgbDropdownMenu {
  dropdown: NgbDropdown;
  nativeElement: HTMLElement;

  @ContentChildren(NgbDropdownItem)
  menuItems!: QueryList<NgbDropdownItem>;

  // `forwardRef`: import circular con `ngb-dropdown.directive.ts` (esa
  // directiva importa `NgbDropdownMenu` de vuelta).
  constructor(
    @Inject(forwardRef(() => NgbDropdown)) dropdown: NgbDropdown,
    @Inject(ElementRef) elementRef: ElementRef<HTMLElement>,
  ) {
    this.dropdown = dropdown;
    this.nativeElement = elementRef.nativeElement;
  }

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
