import { NgbDropdown } from "@ngb/dropdown/ngb-dropdown.directive";
import { Directive, ElementRef, forwardRef, HostBinding, Inject } from "ngjs-core";

/**
 * Marca el elemento al que se ancla el menú del dropdown.
 *
 * Es la versión simple de `NgbDropdownToggle`: cumple el mismo rol pero no
 * escucha `click`, así habilita disparadores que no sean el click.
 */
@Directive({ selector: "[ngbDropdownAnchor]" })
export class NgbDropdownAnchor {
  dropdown: NgbDropdown;
  nativeElement: HTMLElement;

  // `forwardRef`: import circular con `ngb-dropdown.directive.ts` (esa
  // directiva importa `NgbDropdownAnchor` de vuelta).
  constructor(
    @Inject(forwardRef(() => NgbDropdown)) dropdown: NgbDropdown,
    @Inject(ElementRef) elementRef: ElementRef<HTMLElement>,
  ) {
    this.dropdown = dropdown;
    this.nativeElement = elementRef.nativeElement;
  }

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
