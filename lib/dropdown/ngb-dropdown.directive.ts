import type { IAugmentedJQuery, IController, IDirective, IDocumentService, ILogService, IOnChangesObject, IScope, ITimeoutService } from "angular"
import type { Placement } from "@popperjs/core"

import { ngbPositioning, type NgbPositioning, type PlacementArray } from "@/utils/positioning"
import { NgbRTL } from "@/utils/rtl.service"
import type { Options } from "@popperjs/core"
import { getActiveElement, toNativeElement, type INgbEvent } from "@/utils"
import type { NgbDropdownMenu } from "./ngb-dropdown-menu.directive"
import type { NgbDropdownAnchor } from "./ngb-dropdown-anchor.directive"
import { ngbAutoClose, SOURCE } from "@/utils/autoclose"
import { NgbDropdownConfig } from "@/dropdown/ngb-dropdown-config.service"
import angular from "angular"
import { addPopperOffset } from "@/utils/positioning.util"

function isValidElement(element: unknown): element is IAugmentedJQuery {
    return angular.isElement(element)
}

export class NgbDropdown implements IController {
    static ngAcceptInputType_autoClose: boolean | string;
    static ngAcceptInputType_display: string;

    private _bodyContainer: IAugmentedJQuery | null = null;
    private _positioning: NgbPositioning | null = null

    private _menu!: NgbDropdownMenu
    private _anchor!: NgbDropdownAnchor

    private autoClose!: boolean | "inside" | "outside"
    private dropdownClass?: string
    private _open = false
    private placement!: PlacementArray
    private popperOptions!: (options?: Partial<Options>) => Options
    private container?: null | 'body'
    private display?: "dynamic" | "static"

    private openChange?: ({ $event }: INgbEvent<boolean>) => void

    constructor(
        private $config: NgbDropdownConfig,
        private $document: IDocumentService,
        private $element: IAugmentedJQuery,
        private $ngbRTL: NgbRTL,
        private $timeout: ITimeoutService,
        private $scope: IScope,
        private $log: ILogService
    ) { }

    $onInit(): void {
        this._positioning = ngbPositioning(this.$ngbRTL);
        this.autoClose = this.autoClose ?? this.$config.autoClose
        this.placement = this.placement ?? this.$config.placement
        this.popperOptions = this.popperOptions ?? this.$config.popperOptions
        this.container = this.container ?? this.$config.container
    }

    $postLink(): void {
        if (!this.display) {
            const native = toNativeElement(this.$element)
            this.display = native.closest(".navbar") ? 'static' : 'dynamic'
        }

        this.$timeout(() => {
            this._applyPlacementClasses();

            if (!this._open) return
            this._setCloseHandlers();
        }, 0, false)
    }

    registerMenu(menu: NgbDropdownMenu) {
        this._menu = menu
        this.$log.info(`[ngb-dropdown]: Menu Registered`)
        this.$log.info(this._menu)
    }

    $onChanges(changes: IOnChangesObject): void {
        if (changes.container && this._open) {
            this._applyContainer(this.container);
        }

        if (changes.placement && !changes.placement?.isFirstChange()) {
            const nativeContainer = this._bodyContainer ? toNativeElement(this._bodyContainer) : null

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
        this.close()
    }

    public isOpen() {
        return this._open
    }

    public open(): void {
        debugger
        if (this._open) {
            this.$scope.$evalAsync()
            return
        }

        this._open = true
        this._applyContainer(this.container);
        this.openChange?.({ $event: true })
        this._setCloseHandlers();

        if (!this._anchor) {
            this.$scope.$evalAsync()
            return
        }

        this._anchor.nativeElement.focus();

        if (this.display !== 'dynamic') {
            this.$scope.$evalAsync()
            return
        }

        const nativeContainer = this._bodyContainer ? toNativeElement(this._bodyContainer) : null

        this._positioning?.createPopper({
            hostElement: this._anchor.nativeElement,
            targetElement: nativeContainer || this._menu.nativeElement,
            placement: this.placement,
            updatePopperOptions: (options) => {
                const offset = addPopperOffset([0, 2])
                return offset(options)
            }
        })

        this._applyPlacementClasses();

        this.$timeout(() => {
            this._positionMenu();
        }, 0, false)

        this.$scope.$evalAsync()
    }

    private _setCloseHandlers() {
        // this._destroyCloseHandlers$.next();

        //ngbAutoClose()
    }

    public close(): void {
        if (!this._open) return

        this._open = false
        this._positioning?.destroy();
        // this._destroyCloseHandlers$.next();
        this.openChange?.({ $event: false })

        this.$scope.$evalAsync()
    }

    public toggle() {
        if (this.isOpen()) {
            this.close()
            return
        }

        this.open()
    }

    public onKeyDown(event: JQueryEventObject) {
        const { key } = event
        const itemElements = this._getMenuElements();

        let position = -1;
        let itemElement: IAugmentedJQuery | null = null;
        const isEventFromToggle = this._isEventFromToggle(event);

        if (!isEventFromToggle && itemElements.length) {
            for (let index = 0; index < itemElements.length; index++) {
                const item = itemElements[index]
                const native = toNativeElement(item)
                const doc = toNativeElement<Document>(this.$document)

                if (native.contains(event.target as HTMLElement)) {
                    itemElement = item;
                }

                if (native === getActiveElement(doc)) {
                    position = index;
                }
            }
        }

        if (key === ' ' || key === 'Enter') {
            if (itemElement == null) return
            if (!isValidElement(itemElement)) return

            if (this.autoClose === true || this.autoClose === 'inside') {
                const onClick = () => {
                    itemElement.off("click", onClick)
                    this.close()
                }

                itemElement.on("click", onClick)
            }

            return;
        }

        // if (key === 'Tab') {
        //     if (event.target && this.isOpen() && this.autoClose) {
        //         if (this._anchor.nativeElement === event.target) {
        //             if (this.container === 'body' && !event.shiftKey) {
        //                 /* This case is special: user is using [Tab] from the anchor/toggle.
        //        User expects the next focusable element in the dropdown menu to get focus.
        //        But the menu is not a sibling to anchor/toggle, it is at the end of the body.
        //        Trick is to synchronously focus the menu element, and let the [keydown.Tab] go
        //        so that browser will focus the proper element (first one focusable in the menu) */
        //                 this._menu.nativeElement.setAttribute('tabindex', '0');
        //                 this._menu.nativeElement.focus();
        //                 this._menu.nativeElement.removeAttribute('tabindex');
        //             } else if (event.shiftKey) {
        //                 this.close();
        //             }
        //             return;
        //         } else if (this.container === 'body') {
        //             const focusableElements = this._menu.nativeElement.querySelectorAll(FOCUSABLE_ELEMENTS_SELECTOR);
        //             if (event.shiftKey && event.target === focusableElements[0]) {
        //                 this._anchor.nativeElement.focus();
        //                 event.preventDefault();
        //             } else if (!event.shiftKey && event.target === focusableElements[focusableElements.length - 1]) {
        //                 this._anchor.nativeElement.focus();
        //                 this.close();
        //             }
        //         } else {
        //             fromEvent<FocusEvent>(event.target as HTMLElement, 'focusout')
        //                 .pipe(take(1))
        //                 .subscribe(({ relatedTarget }) => {
        //                     if (!this._nativeElement.contains(relatedTarget as HTMLElement)) {
        //                         this.close();
        //                     }
        //                 });
        //         }
        //     }
        //     return;
        // }

        // // opening / navigating
        // if (isEventFromToggle || itemElement) {
        //     this.open();

        //     if (itemElements.length) {
        //         switch (key) {
        //             case 'ArrowDown':
        //                 position = Math.min(position + 1, itemElements.length - 1);
        //                 break;
        //             case 'ArrowUp':
        //                 if (this._isDropup() && position === -1) {
        //                     position = itemElements.length - 1;
        //                     break;
        //                 }
        //                 position = Math.max(position - 1, 0);
        //                 break;
        //             case 'Home':
        //                 position = 0;
        //                 break;
        //             case 'End':
        //                 position = itemElements.length - 1;
        //                 break;
        //         }
        //         itemElements[position].focus();
        //     }
        //     event.preventDefault();
        // }
    }

    private _isDropUp(): boolean {
        return this.$element.hasClass("dropup")
    }

    private _isEventFromToggle(event: JQueryEventObject) {
        return this._anchor.nativeElement.contains(event.target as HTMLElement);
    }

    private _getMenuElements(): IAugmentedJQuery[] {
        if (!this._menu) return []
        return this._menu.menuItems.filter(({ disabled }) => !disabled).map(({ $element }) => $element)
    }

    private _positionMenu() {
        if (!this.isOpen() && !this._menu) return;

        if (this.display !== 'dynamic') {
            this._applyPlacementClasses(this._getFirstPlacement(this.placement));
            return
        }

        this._positioning?.update();
        this._applyPlacementClasses();
    }

    private _getFirstPlacement(placement: PlacementArray): Placement {
        const isArray = Array.isArray(placement)
        if (!isArray) {
            const [first] = placement.split(' ')
            return first as Placement
        }

        const [first] = placement
        return first as Placement
    }

    private _resetContainer() {
        if (this._menu) {
            this.$element.append(this._menu.$element)
        }

        if (this._bodyContainer) {
            const body = this.$document.find("body")
            body.append(this._bodyContainer)
            this._bodyContainer = null
        }
    }

    private _applyContainer(container: null | 'body' = null) {
        this._resetContainer()

        if (container === 'body') {
            this._bodyContainer = this._bodyContainer ?? angular.element("<div></div>")
            this._bodyContainer.css({
                position: "absolute",
                zIndex: "1055"
            })

            this._menu.$element.css({
                position: "static"
            })

            this.$document.append(this._bodyContainer)
        }

        if (!this.dropdownClass) return
        this._applyCustomDropdownClass(this.dropdownClass);
    }

    private _applyCustomDropdownClass(newClass: string, oldClass?: string) {
        const target = this.container === 'body' ? this._bodyContainer : this.$element
        if (!target) return;

        if (oldClass) target.removeClass(oldClass)
        if (newClass) target.addClass(newClass)
    }

    private _applyPlacementClasses(placement?: Placement | null) {
        if (!this._menu) return;

        this.$element.removeClass("dropup dropdown")
        if (this.display === 'static') {
            this._menu.$element.attr("data-bs-popper", 'static')
        } else this._menu.$element.removeAttr("data-bs-popper")

        const dropdownClass = placement?.search('^top') !== -1 ? 'dropup' : 'dropdown';
        this.$element.addClass(dropdownClass)

        if (this._bodyContainer) {
            this._bodyContainer.removeClass("dropup dropdown")
            this._bodyContainer.addClass(dropdownClass)
        }
    }

    //#region $angular

    static get $name() {
        return "ngbDropdown"
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
                placement: "<?"
            },
            controller: NgbDropdown,
        })
    }

    static get $inject() {
        return [
            NgbDropdownConfig.$name,
            "$document",
            '$element',
            NgbRTL.$name,
            "$timeout",
            '$scope',
            "$log",
            "$q"
        ]
    }

    //#endregion
}
