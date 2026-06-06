import { type INgbDropdownAnchor, NgbDropdownConfig } from "@ngb/dropdown/ngb-dropdown-config.service";
import type { NgbDropdownMenu } from "@ngb/dropdown/ngb-dropdown-menu.directive";
import { FOCUSABLE_ELEMENTS_SELECTOR, getActiveElement, type INgbEvent, toNativeElement } from "@ngb/utils";
import { ngbAutoClose, SOURCE } from "@ngb/utils/autoclose";
import { type NgbPositioning, ngbPositioning, type PlacementArray } from "@ngb/utils/positioning";
import { addPopperOffset } from "@ngb/utils/positioning.util";
import { NgbRTL } from "@ngb/utils/rtl.service";
import type { Options, Placement } from "@popperjs/core";
import type {
  IAugmentedJQuery,
  IController,
  IDirective,
  ILogService,
  IOnChangesObject,
  IScope,
  ITimeoutService,
} from "angular";
import angular from "angular";
import { fromEvent, Subject, take } from "rxjs";

export class NgbDropdown implements IController {
  static ngAcceptInputType_autoClose: boolean | string;
  static ngAcceptInputType_display: string;

  private _bodyContainer: IAugmentedJQuery | null = null;
  private _positioning: NgbPositioning | null = null;

  private _menu!: NgbDropdownMenu;
  private _anchor!: INgbDropdownAnchor;
  private _destroyCloseHandlers$ = new Subject<void>();
  private _unwatchOpenState?: () => void;

  private autoClose!: boolean | "inside" | "outside";
  private dropdownClass?: string;
  private _open = false;
  private placement!: PlacementArray;
  private popperOptions!: (options?: Partial<Options>) => Options;
  private container?: null | "body";
  private display?: "dynamic" | "static";

  private openChange?: ({ $event }: INgbEvent<boolean>) => void;

  constructor(
    private $config: NgbDropdownConfig,
    private $element: IAugmentedJQuery,
    private $ngbRTL: NgbRTL,
    private $timeout: ITimeoutService,
    private $scope: IScope,
    private $log: ILogService,
  ) {}

  $onInit(): void {
    this._positioning = ngbPositioning(this.$ngbRTL);
    this.autoClose = this.autoClose ?? this.$config.autoClose;
    this.placement = this.placement ?? this.$config.placement;
    this.popperOptions = this.popperOptions ?? this.$config.popperOptions;
    this.container = this.container ?? this.$config.container;

    this._unwatchOpenState = this.$scope.$watch(
      () => this.isOpen(),
      (isOpen) => this.$element.toggleClass("show", isOpen),
    );
  }

  $postLink(): void {
    if (!this.display) {
      const native = toNativeElement(this.$element);
      this.display = native.closest(".navbar") ? "static" : "dynamic";
    }

    this.$timeout(
      () => {
        this._applyPlacementClasses();

        if (!this._open) return;
        this._setCloseHandlers();
      },
      0,
      false,
    );
  }

  registerMenu(menu: NgbDropdownMenu) {
    this._menu = menu;
    this.$log.info(`[ngb-dropdown]: Menu Registered`);
    this.$log.info(this._menu);
  }

  registerAnchor(anchor: INgbDropdownAnchor) {
    if (this._anchor) return;

    this._anchor = anchor;
    this.$log.info(`[ngb-dropdown]: Anchor Registered`);
    this.$log.info(this._anchor);
  }

  $onChanges(changes: IOnChangesObject): void {
    if (changes.container && !changes.container.isFirstChange()) {
      this._validateContainer(this.container);
    }

    if (changes.container && this._open) {
      this._applyContainer(this.container);
    }

    if (changes.placement && !changes.placement?.isFirstChange()) {
      const nativeContainer = this._bodyContainer ? toNativeElement(this._bodyContainer) : null;

      this._positioning?.setOptions({
        hostElement: this._anchor.nativeElement,
        targetElement: nativeContainer || this._menu.nativeElement,
        placement: this.placement,
      });
      this._applyPlacementClasses();
    }

    if (changes.dropdownClass) {
      const { currentValue, previousValue } = changes.dropdownClass;
      this._applyCustomDropdownClass(currentValue, previousValue);
    }

    if (changes.autoClose && this._open) {
      this.autoClose = changes.autoClose.currentValue;
      this._setCloseHandlers();
    }
  }

  $onDestroy(): void {
    this.close();
    this._unwatchOpenState?.();
  }

  public isOpen() {
    return this._open;
  }

  public open(): void {
    if (this._open) {
      this.$scope.$evalAsync();
      return;
    }

    this._assertMenu();
    this._assertAnchor();

    this._open = true;
    this._applyContainer(this.container);
    this.openChange?.({ $event: true });
    this._setCloseHandlers();

    this._anchor.nativeElement.focus();

    if (this.display !== "dynamic") {
      this.$scope.$evalAsync();
      return;
    }

    const nativeContainer = this._bodyContainer ? toNativeElement(this._bodyContainer) : null;

    this._positioning?.createPopper({
      hostElement: this._anchor.nativeElement,
      targetElement: nativeContainer || this._menu.nativeElement,
      placement: this.placement,
      updatePopperOptions: (options) => this.popperOptions(addPopperOffset([0, 2])(options)),
    });

    this._applyPlacementClasses();

    this.$timeout(
      () => {
        this._positionMenu();
      },
      0,
      false,
    );

    this.$scope.$evalAsync();
  }

  private _setCloseHandlers() {
    this._destroyCloseHandlers$.next();

    ngbAutoClose(
      this.$timeout,
      this.autoClose,
      this._destroyCloseHandlers$,
      (source: SOURCE) => {
        this.close();
        if (source === SOURCE.ESCAPE) {
          this._anchor?.nativeElement.focus();
        }
      },
      this._menu ? [this._menu.nativeElement] : [],
      this._anchor ? [this._anchor.nativeElement] : [],
      ".dropdown-item,.dropdown-divider",
    );
  }

  public close(): void {
    if (!this._open) return;

    this._open = false;
    this._resetContainer();
    this._positioning?.destroy();
    this._destroyCloseHandlers$.next();
    this.openChange?.({ $event: false });

    this.$scope.$evalAsync();
  }

  public toggle() {
    if (this.isOpen()) {
      this.close();
      return;
    }

    this.open();
  }

  public onKeyDown(event: JQueryEventObject) {
    const { key } = event;
    const itemElements = this._getMenuElements();

    let position = -1;
    let itemElement: IAugmentedJQuery | null = null;
    const isEventFromToggle = this._isEventFromToggle(event);

    if (!isEventFromToggle && itemElements.length) {
      for (let index = 0; index < itemElements.length; index++) {
        const item = itemElements[index];
        const native = toNativeElement(item);

        if (native.contains(event.target as HTMLElement)) {
          itemElement = item;
        }

        if (native === getActiveElement()) {
          position = index;
        }
      }
    }

    if (key === " " || key === "Enter") {
      if (itemElement == null) return;

      if (this.autoClose === true || this.autoClose === "inside") {
        fromEvent(toNativeElement(itemElement), "click")
          .pipe(take(1))
          .subscribe(() => this.close());
      }

      return;
    }

    if (key === "Tab") {
      if (!event.target || !this.isOpen() || !this.autoClose) return;

      const target = event.target as HTMLElement;
      const isFromAnchor = this._anchor.nativeElement === target;
      const isBodyContainer = this.container === "body";

      const focusMenuForBodyContainer = () => {
        this._menu.nativeElement.setAttribute("tabindex", "0");
        this._menu.nativeElement.focus();
        this._menu.nativeElement.removeAttribute("tabindex");
      };

      const handleAnchorTab = () => {
        if (isBodyContainer && !event.shiftKey) focusMenuForBodyContainer();
        if (event.shiftKey) this.close();
      };

      const handleBodyContainerTab = () => {
        const focusableElements = this._menu.nativeElement.querySelectorAll(FOCUSABLE_ELEMENTS_SELECTOR);
        const actions = [
          {
            shouldRun: event.shiftKey && target === focusableElements[0],
            run: () => {
              this._anchor.nativeElement.focus();
              event.preventDefault();
            },
          },
          {
            shouldRun: !event.shiftKey && target === focusableElements[focusableElements.length - 1],
            run: () => {
              this._anchor.nativeElement.focus();
              this.close();
            },
          },
        ];

        actions.find(({ shouldRun }) => shouldRun)?.run();
      };

      const handleInlineTab = () => {
        fromEvent<FocusEvent>(target, "focusout")
          .pipe(take(1))
          .subscribe(({ relatedTarget }) => {
            if (!toNativeElement(this.$element).contains(relatedTarget as HTMLElement)) {
              this.close();
            }
          });
      };

      if (isFromAnchor) {
        handleAnchorTab();
        return;
      }

      if (isBodyContainer) handleBodyContainerTab();
      if (!isBodyContainer) handleInlineTab();
      return;
    }

    if (isEventFromToggle || itemElement) {
      this.open();

      if (itemElements.length) {
        const actions: Record<string, () => number> = {
          ArrowDown: () => Math.min(position + 1, itemElements.length - 1),
          ArrowUp: () => (this._isDropUp() && position === -1 ? itemElements.length - 1 : Math.max(position - 1, 0)),
          Home: () => 0,
          End: () => itemElements.length - 1,
        };

        const nextPosition = actions[key]?.();
        if (nextPosition != null) position = nextPosition;

        toNativeElement(itemElements[position]).focus();
      }
      event.preventDefault();
    }
  }

  private _isDropUp(): boolean {
    return this.$element.hasClass("dropup");
  }

  private _isEventFromToggle(event: JQueryEventObject) {
    if (!this._anchor) return false;
    return this._anchor.nativeElement.contains(event.target as HTMLElement);
  }

  private _getMenuElements(): IAugmentedJQuery[] {
    if (!this._menu) return [];
    return this._menu.menuItems.filter(({ disabled }) => !disabled).map(({ $element }) => $element);
  }

  private _positionMenu() {
    if (!this.isOpen() || !this._menu) return;

    if (this.display !== "dynamic") {
      this._applyPlacementClasses(this._getFirstPlacement(this.placement));
      return;
    }

    this._positioning?.update();
    this._applyPlacementClasses();
  }

  private _getFirstPlacement(placement: PlacementArray): Placement {
    const isArray = Array.isArray(placement);
    if (!isArray) {
      const [first] = placement.split(" ");
      return first as Placement;
    }

    const [first] = placement;
    return first as Placement;
  }

  private _resetContainer() {
    if (this._menu) {
      this.$element.append(this._menu.$element);
    }

    if (this._bodyContainer) {
      this._bodyContainer.remove();
      this._bodyContainer = null;
    }
  }

  private _applyContainer(container: null | "body" = null) {
    this._assertMenu();
    this._resetContainer();

    if (container === "body") {
      this._bodyContainer = this._bodyContainer ?? angular.element("<div></div>");
      this._bodyContainer.css({
        position: "absolute",
        zIndex: "1055",
      });

      this._menu.$element.css({
        position: "static",
      });

      this._bodyContainer.append(this._menu.$element);
      angular.element(document.body).append(this._bodyContainer);
    }

    this._applyCustomDropdownClass(this.dropdownClass!);
  }

  private _applyCustomDropdownClass(newClass: string, oldClass?: string) {
    const target = this.container === "body" ? this._bodyContainer : this.$element;
    if (!target) return;

    if (oldClass) target.removeClass(oldClass);
    if (newClass) target.addClass(newClass);
  }

  private _validateContainer(container?: null | string) {
    if (container == null || container === "body") return;

    throw new Error(`[ngb-dropdown]: Unsupported container value "${container}". Use "body" or null.`);
  }

  private _assertAnchor() {
    if (this._anchor) return;

    throw new Error(`[ngb-dropdown]: NgbDropdown requires an ngbDropdownToggle or ngbDropdownAnchor.`);
  }

  private _assertMenu() {
    if (this._menu) return;

    throw new Error(`[ngb-dropdown]: NgbDropdown requires an ngbDropdownMenu.`);
  }

  private _applyPlacementClasses(placement?: Placement | null) {
    if (!this._menu) return;
    placement = placement || this._getFirstPlacement(this.placement);

    this.$element.removeClass("dropup dropdown");
    if (this.display === "static") {
      this._menu.$element.attr("data-bs-popper", "static");
    } else this._menu.$element.removeAttr("data-bs-popper");

    const dropdownClass = placement?.search("^top") !== -1 ? "dropup" : "dropdown";
    this.$element.addClass(dropdownClass);

    if (this._bodyContainer) {
      this._bodyContainer.removeClass("dropup dropdown");
      this._bodyContainer.addClass(dropdownClass);
    }
  }

  //#region $angular

  static get $name() {
    return "ngbDropdown";
  }

  static get $factory(): () => IDirective {
    return () => ({
      restrict: "A",
      scope: true,
      bindToController: {
        autoClose: "<?",
        animation: "<?",
        container: "@?",
        display: "<?",
        dropdownClass: "<?",
        _open: "<?open",
        popperOptions: "<?",
        openChange: "&?",
        placement: "<?",
      },
      controller: NgbDropdown,
    });
  }

  static get $inject() {
    return [NgbDropdownConfig.$name, "$element", NgbRTL.$name, "$timeout", "$scope", "$log"];
  }

  //#endregion
}
