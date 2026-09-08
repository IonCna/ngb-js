import { NgbDropdownAnchor } from "@ngb/dropdown/ngb-dropdown-anchor.directive";
import { NgbDropdownConfig } from "@ngb/dropdown/ngb-dropdown-config.service";
import type { NgbDropdownItem } from "@ngb/dropdown/ngb-dropdown-item.directive";
import { NgbDropdownMenu } from "@ngb/dropdown/ngb-dropdown-menu.directive";
import { FOCUSABLE_ELEMENTS_SELECTOR, getActiveElement } from "@ngb/utils";
import { ngbAutoClose, SOURCE } from "@ngb/utils/autoclose";
import { ngbPositioning, type Placement, type PlacementArray } from "@ngb/utils/positioning";
import { addPopperOffset } from "@ngb/utils/positioning.util";
import type { Options } from "@popperjs/core";
import { fromEvent, Subject } from "rxjs";
import { take } from "rxjs/operators";
import {
  afterEveryRender,
  afterNextRender,
  type AfterRenderRef,
  ChangeDetectorRef,
  ContentChild,
  Directive,
  DOCUMENT,
  ElementRef,
  EventEmitter,
  HostBinding,
  inject,
  Injector,
  Input,
  NgZone,
  type OnChanges,
  type OnDestroy,
  type OnInit,
  Output,
  type SimpleChanges,
} from "ngjs-core";

/**
 * Provee overlays contextuales para mostrar listas de enlaces y más.
 */
@Directive({ selector: "[ngbDropdown]", exportAs: "ngbDropdown" })
export class NgbDropdown implements OnInit, OnChanges, OnDestroy {
  static ngAcceptInputType_autoClose: boolean | string;
  static ngAcceptInputType_display: string;

  private _changeDetector = inject(ChangeDetectorRef);
  private _config = inject(NgbDropdownConfig);
  private _document = inject(DOCUMENT);
  private _injector = inject(Injector);
  private _ngZone = inject(NgZone);
  private _nativeElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  private _destroyCloseHandlers$ = new Subject<void>();
  private _afterRenderRef: AfterRenderRef | undefined;
  private _bodyContainer: HTMLElement | null = null;

  private _positioning: ReturnType<typeof ngbPositioning> = ngbPositioning();

  @ContentChild(NgbDropdownMenu) private _menu!: NgbDropdownMenu;
  @ContentChild(NgbDropdownAnchor) private _anchor!: NgbDropdownAnchor;

  /**
   * Los `NgbDropdownItem` proyectados. No existe en ng-bootstrap (usa
   * `_getMenuElements()` privado) — se mantiene como conveniencia de la API de
   * `ngb-js`; al migrar a Angular real se borra.
   */
  get menuItems() {
    return this._menu?.menuItems;
  }

  /**
   * Si el dropdown se cierra al hacer click en un ítem o al presionar ESC.
   *
   * * `true` — cierra con clicks de adentro (menú) y de afuera.
   * * `false` — solo se cierra a mano con `close()` / `toggle()`.
   * * `"inside"` — cierra con clicks del menú, no con los de afuera.
   * * `"outside"` — cierra solo con clicks de afuera, no con los del menú.
   */
  @Input() autoClose: boolean | "inside" | "outside" = this._config.autoClose;

  /** Clase custom aplicada solo al elemento padre de `ngbDropdownMenu`. */
  @Input() dropdownClass?: string;

  /** Si el menú arranca abierto. */
  @Input("open") _open = false;

  /**
   * Ubicación preferida del dropdown. Orden por defecto:
   * `"bottom-start bottom-end top-start top-end"`.
   */
  @Input() placement: PlacementArray = this._config.placement;

  /** Permite modificar las opciones de Popper al posicionar el dropdown. */
  @Input() popperOptions: (options: Partial<Options>) => Partial<Options> = this._config.popperOptions;

  /** Selector del elemento al que adjuntar el menú. Solo soporta `"body"`. */
  @Input({ binding: "@" }) container: null | "body" = this._config.container;

  /** Habilita/deshabilita el posicionamiento dinámico. Por defecto `"dynamic"` salvo dentro de un navbar. */
  @Input({ binding: "@" }) display!: "dynamic" | "static";

  /** Se emite cuando el dropdown se abre (`true`) o se cierra (`false`). */
  @Output() openChange = new EventEmitter<boolean>();

  @HostBinding("class.show")
  get _show(): boolean {
    return this.isOpen();
  }

  ngOnInit(): void {
    if (!this.display) {
      this.display = this._nativeElement.closest(".navbar") ? "static" : "dynamic";
    }

    afterNextRender(
      {
        write: () => {
          this._applyPlacementClasses();
          if (this._open) {
            this._setCloseHandlers();
          }
        },
      },
      { injector: this._injector },
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.container && this._open) {
      this._applyContainer(this.container);
    }

    if (changes.placement && !changes.placement.firstChange) {
      this._positioning.setOptions({
        hostElement: this._anchor.nativeElement,
        targetElement: this._bodyContainer || this._menu.nativeElement,
        placement: this.placement,
      });
      this._applyPlacementClasses();
    }

    if (changes.dropdownClass) {
      const { currentValue, previousValue } = changes.dropdownClass;
      this._applyCustomDropdownClass(currentValue as string | undefined, previousValue as string | undefined);
    }

    if (changes.autoClose && this._open) {
      this.autoClose = changes.autoClose.currentValue as boolean | "inside" | "outside";
      this._setCloseHandlers();
    }
  }

  /** Indica si el menú está abierto. */
  isOpen(): boolean {
    return this._open;
  }

  /** Abre el menú del dropdown. */
  open(): void {
    if (!this._open) {
      this._open = true;
      this._applyContainer(this.container);
      this.openChange.emit(true);
      this._setCloseHandlers();
      if (this._anchor) {
        this._anchor.nativeElement.focus();
        if (this.display === "dynamic") {
          this._ngZone.runOutsideAngular(() => {
            this._positioning.createPopper({
              hostElement: this._anchor.nativeElement,
              targetElement: this._bodyContainer || this._menu.nativeElement,
              placement: this.placement,
              updatePopperOptions: (options) => this.popperOptions(addPopperOffset([0, 2])(options)),
            });
            this._applyPlacementClasses();
            this._afterRenderRef = afterEveryRender(
              {
                write: () => {
                  this._positionMenu();
                },
              },
              { injector: this._injector },
            );
          });
        }
      }
      this._changeDetector.markForCheck();
    }
  }

  private _setCloseHandlers(): void {
    this._destroyCloseHandlers$.next();

    ngbAutoClose(
      this._ngZone,
      this._document,
      this.autoClose,
      (source: SOURCE) => {
        this.close();
        if (source === SOURCE.ESCAPE) {
          this._anchor?.nativeElement.focus();
        }
      },
      this._destroyCloseHandlers$,
      this._menu ? [this._menu.nativeElement] : [],
      this._anchor ? [this._anchor.nativeElement] : [],
      ".dropdown-item,.dropdown-divider",
    );
  }

  /** Cierra el menú del dropdown. */
  close(): void {
    if (this._open) {
      this._open = false;
      this._resetContainer();
      this._positioning.destroy();
      this._afterRenderRef?.destroy();
      this._destroyCloseHandlers$.next();
      this.openChange.emit(false);
      this._changeDetector.markForCheck();
    }
  }

  /** Alterna el menú del dropdown. */
  toggle(): void {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  ngOnDestroy(): void {
    this.close();
  }

  onKeyDown(event: JQueryEventObject | KeyboardEvent): void {
    const { key } = event;
    const itemElements = this._getMenuElements();

    let position = -1;
    let itemElement: HTMLElement | null = null;
    const isEventFromToggle = this._isEventFromToggle(event);

    if (!isEventFromToggle && itemElements.length) {
      itemElements.forEach((item, index) => {
        if (item.contains(event.target as HTMLElement)) {
          itemElement = item;
        }
        if (item === getActiveElement(this._document)) {
          position = index;
        }
      });
    }

    // Cerrar con Enter / Space
    if (key === " " || key === "Enter") {
      if (itemElement && (this.autoClose === true || this.autoClose === "inside")) {
        // El ítem es un botón o un link → el browser dispara `click` en Enter/Space.
        // Un handler `click` de una sola vez, después de los del usuario, cierra el dropdown.
        fromEvent(itemElement, "click")
          .pipe(take(1))
          .subscribe(() => this.close());
      }
      return;
    }

    if (key === "Tab") {
      if (event.target && this.isOpen() && this.autoClose) {
        if (this._anchor.nativeElement === event.target) {
          if (this.container === "body" && !(event as KeyboardEvent).shiftKey) {
            this._menu.nativeElement.setAttribute("tabindex", "0");
            this._menu.nativeElement.focus();
            this._menu.nativeElement.removeAttribute("tabindex");
          } else if ((event as KeyboardEvent).shiftKey) {
            this.close();
          }
          return;
        }
        if (this.container === "body") {
          const focusableElements = this._menu.nativeElement.querySelectorAll(FOCUSABLE_ELEMENTS_SELECTOR);
          if ((event as KeyboardEvent).shiftKey && event.target === focusableElements[0]) {
            this._anchor.nativeElement.focus();
            event.preventDefault();
          } else if (
            !(event as KeyboardEvent).shiftKey &&
            event.target === focusableElements[focusableElements.length - 1]
          ) {
            this._anchor.nativeElement.focus();
            this.close();
          }
        } else {
          fromEvent<FocusEvent>(event.target as HTMLElement, "focusout")
            .pipe(take(1))
            .subscribe(({ relatedTarget }) => {
              if (!this._nativeElement.contains(relatedTarget as HTMLElement)) {
                this.close();
              }
            });
        }
      }
      return;
    }

    // Abrir / navegar
    if (isEventFromToggle || itemElement) {
      this.open();

      if (itemElements.length) {
        switch (key) {
          case "ArrowDown":
            position = Math.min(position + 1, itemElements.length - 1);
            break;
          case "ArrowUp":
            if (this._isDropup() && position === -1) {
              position = itemElements.length - 1;
              break;
            }
            position = Math.max(position - 1, 0);
            break;
          case "Home":
            position = 0;
            break;
          case "End":
            position = itemElements.length - 1;
            break;
        }
        itemElements[position].focus();
      }
      event.preventDefault();
    }
  }

  private _isDropup(): boolean {
    return this._nativeElement.classList.contains("dropup");
  }

  private _isEventFromToggle(event: JQueryEventObject | KeyboardEvent): boolean {
    return this._anchor ? this._anchor.nativeElement.contains(event.target as HTMLElement) : false;
  }

  private _getMenuElements(): HTMLElement[] {
    return this._menu
      ? this._menu.menuItems.filter((item: NgbDropdownItem) => !item.isDisabled()).map(({ nativeElement }) => nativeElement)
      : [];
  }

  private _positionMenu(): void {
    const menu = this._menu;
    if (this.isOpen() && menu) {
      if (this.display === "dynamic") {
        this._positioning.update();
        this._applyPlacementClasses();
      } else {
        this._applyPlacementClasses(this._getFirstPlacement(this.placement));
      }
    }
  }

  private _getFirstPlacement(placement: PlacementArray): Placement {
    return Array.isArray(placement) ? placement[0] : (placement.split(" ")[0] as Placement);
  }

  private _resetContainer(): void {
    if (this._menu) {
      this._nativeElement.appendChild(this._menu.nativeElement);
    }
    if (this._bodyContainer) {
      this._document.body.removeChild(this._bodyContainer);
      this._bodyContainer = null;
    }
  }

  private _applyContainer(container: null | "body" = null): void {
    this._resetContainer();
    if (container === "body") {
      const dropdownMenuElement = this._menu.nativeElement;
      const bodyContainer = (this._bodyContainer = this._bodyContainer || this._document.createElement("div"));

      bodyContainer.style.position = "absolute";
      dropdownMenuElement.style.position = "static";
      bodyContainer.style.zIndex = "1055";

      bodyContainer.appendChild(dropdownMenuElement);
      this._document.body.appendChild(bodyContainer);
    }

    this._applyCustomDropdownClass(this.dropdownClass);
  }

  private _applyCustomDropdownClass(newClass?: string, oldClass?: string): void {
    const targetElement = this.container === "body" ? this._bodyContainer : this._nativeElement;
    if (targetElement) {
      if (oldClass) {
        targetElement.classList.remove(oldClass);
      }
      if (newClass) {
        targetElement.classList.add(newClass);
      }
    }
  }

  private _applyPlacementClasses(placement?: Placement | null): void {
    if (this._menu) {
      if (!placement) {
        placement = this._getFirstPlacement(this.placement);
      }

      this._nativeElement.classList.remove("dropup", "dropdown");
      if (this.display === "static") {
        this._menu.nativeElement.setAttribute("data-bs-popper", "static");
      } else {
        this._menu.nativeElement.removeAttribute("data-bs-popper");
      }

      const dropdownClass = placement.search("^top") !== -1 ? "dropup" : "dropdown";
      this._nativeElement.classList.add(dropdownClass);

      if (this._bodyContainer) {
        this._bodyContainer.classList.remove("dropup", "dropdown");
        this._bodyContainer.classList.add(dropdownClass);
      }
    }
  }
}
