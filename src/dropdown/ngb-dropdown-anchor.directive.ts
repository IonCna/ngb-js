import { NgbDropdown } from "@ngb/dropdown/ngb-dropdown.directive";
import { Directive, ElementRef, HostBinding, inject } from "ngjs-core";

/**
 * Marca el elemento al que se ancla el menú del dropdown.
 *
 * Es la versión simple de `NgbDropdownToggle`: cumple el mismo rol pero no
 * escucha `click`, así habilita disparadores que no sean el click.
 */
@Directive({ selector: "[ngbDropdownAnchor]" })
export class NgbDropdownAnchor {
  dropdown = inject(NgbDropdown);
  nativeElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  @HostBinding("class.dropdown-toggle")
  readonly _dropdownToggleClass = true;

  @HostBinding("class.show")
  get _show(): boolean {
    return this.dropdown.isOpen();
  }

  @HostBinding("attr.aria-expanded")
  get _ariaExpanded(): string {
    return `${this.dropdown.isOpen()}`;
  }
}
