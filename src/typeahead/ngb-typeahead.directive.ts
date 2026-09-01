import type { ResultTemplateContext } from "@ngb/typeahead/ngb-result-template-context.model";
import { NgbTypeaheadConfig } from "@ngb/typeahead/ngb-typeahead-config.service";
import type { NgbTypeaheadSelectItemEvent } from "@ngb/typeahead/ngb-typeahead-select-item-event.model";
import { NgbTypeaheadWindow } from "@ngb/typeahead/ngb-typeahead-window";
import { toString as ngbToString, toNativeElement } from "@ngb/utils";
import { LiveService } from "@ngb/utils/accessibility/live.service";
import { ngbAutoClose } from "@ngb/utils/autoclose";
import { PopupService } from "@ngb/utils/popup.service";
import { type NgbPositioning, ngbPositioning, type PlacementArray } from "@ngb/utils/positioning";
import { addPopperOffset } from "@ngb/utils/positioning.util";
import { NgbRTL } from "@ngb/utils/rtl.service";
import type { Options } from "@popperjs/core";
import type angular from "angular";
import type {
  IAugmentedJQuery,
  IController,
  IDirective,
  INgModelController,
  IOnChangesObject,
  IPromise,
  IQService,
  IScope,
} from "angular";
import { ChangeDetectorRef, type ComponentRef, NgZone, type TemplateRef, ViewContainerRef } from "ngjs-core";
import {
  BehaviorSubject,
  fromEvent,
  map,
  type Observable,
  type OperatorFunction,
  of,
  Subject,
  type Subscription,
  switchMap,
  tap,
} from "rxjs";

let nextWindowId = 0;

export class NgbTypeahead implements IController {
  private autocomplete?: string;
  private container?: unknown;
  private editable?: boolean;
  private focusFirst?: boolean;
  private inputFormatter?: (item: any) => string;
  private ngbTypeahead?: OperatorFunction<string, readonly any[]> | null;
  private resultFormatter?: (item: any) => string;
  private resultTemplate?: TemplateRef<ResultTemplateContext>;
  private selectOnExact?: boolean;
  private showHint?: boolean;
  private placement?: PlacementArray;
  private popperOptions?: (options: Partial<Options>) => Partial<Options>;
  private popupClass?: string;

  protected selectItem?: ({ $event }: { $event: NgbTypeaheadSelectItemEvent }) => void;

  public activeDescendant: string | null = null;
  public readonly popupId = `ngb-typeahead-${nextWindowId++}`;

  private ngModelCtrl?: INgModelController;
  private _onTouched = () => {};
  private _onChange = (_value: any) => {};
  private _positioning!: NgbPositioning;
  private readonly _popupService: PopupService<NgbTypeaheadWindow>;
  private readonly $q: IQService;
  private _valueChanges$!: Observable<string>;
  private _resubscribeTypeahead$ = new BehaviorSubject<null>(null);
  private _closed$ = new Subject<void>();
  private _inputValueBackup: string | null = null;
  private _inputValueForSelectOnExact: string | null = null;
  private _subscription: Subscription | null = null;
  private _windowRef: ComponentRef<NgbTypeaheadWindow> | null = null;
  private _openingPromise?: IPromise<void>;
  private _unwatchPositioning?: () => void;

  constructor(
    private readonly $element: IAugmentedJQuery,
    private readonly $scope: IScope,
    private readonly _config: NgbTypeaheadConfig,
    private readonly _live: LiveService,
    private readonly _ngZone: NgZone,
    private readonly _changeDetector: ChangeDetectorRef,
    $injector: angular.auto.IInjectorService,
    viewContainerRef: ViewContainerRef,
    private readonly _rtl: NgbRTL,
  ) {
    this.$q = $injector.get<IQService>("$q");
    this._popupService = new PopupService<NgbTypeaheadWindow>(
      NgbTypeaheadWindow.$name,
      $injector,
      viewContainerRef,
      this._ngZone,
    );
  }

  $onInit(): void {
    this._positioning = ngbPositioning(this._rtl);
    this.autocomplete = this.autocomplete ?? "off";
    this.container = this.container ?? this._config.container;
    this.editable = this.editable ?? this._config.editable;
    this.focusFirst = this.focusFirst ?? this._config.focusFirst;
    this.selectOnExact = this.selectOnExact ?? this._config.selectOnExact;
    this.showHint = this.showHint ?? this._config.showHint;
    this.placement = this.placement ?? this._config.placement;
    this.popperOptions = this.popperOptions ?? this._config.popperOptions;

    const nativeElement = this._nativeElement;
    this._valueChanges$ = fromEvent<Event>(nativeElement, "input").pipe(
      map(($event) => ($event.target as HTMLInputElement).value),
    );

    if (this.ngModelCtrl) {
      const ngModelCtrl = this.ngModelCtrl;
      ngModelCtrl.$render = () => this.writeValue(ngModelCtrl.$viewValue);
      this.registerOnChange((value) => ngModelCtrl.$setViewValue(value));
      this.registerOnTouched(() => ngModelCtrl.$setTouched());
      ngModelCtrl.$render();
    }

    this._subscribeToUserInput();
  }

  $postLink(): void {
    this.$element.on("blur", this._handleBlurEvent);
    this.$element.on("keydown", this._handleKeyDownEvent);
    this.$element.attr("autocapitalize", "off");
    this.$element.attr("autocorrect", "off");
    this.$element.attr("role", "combobox");
    this._renderHostState();
  }

  $onChanges(changes: IOnChangesObject): void {
    const ngbTypeahead = changes.ngbTypeahead;
    if (ngbTypeahead && !ngbTypeahead.isFirstChange()) {
      this._unsubscribeFromUserInput();
      this._subscribeToUserInput();
    }

    this._renderHostState();
  }

  $onDestroy(): void {
    this.$element.off("blur", this._handleBlurEvent);
    this.$element.off("keydown", this._handleKeyDownEvent);
    this._closePopup();
    this._unsubscribeFromUserInput();
    this._closed$.complete();
    this._resubscribeTypeahead$.complete();
  }

  registerOnChange(fn: (value: any) => any): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => any): void {
    this._onTouched = fn;
  }

  writeValue(value: any): void {
    this._writeInputValue(this._formatItemForInput(value));
    if (this.showHint) {
      this._inputValueBackup = value;
    }
  }

  setDisabledState(isDisabled: boolean): void {
    this._nativeElement.disabled = isDisabled;
  }

  dismissPopup(): void {
    if (this.isPopupOpen()) {
      this._resubscribeTypeahead$.next(null);
      this._closePopup();
      if (this.showHint && this._inputValueBackup !== null) {
        this._writeInputValue(this._inputValueBackup);
      }
      this._changeDetector.markForCheck();
    }
  }

  isPopupOpen(): boolean {
    return this._windowRef != null;
  }

  handleBlur(): void {
    this._resubscribeTypeahead$.next(null);
    this._onTouched();
  }

  handleKeyDown(event: KeyboardEvent | JQueryEventObject): void {
    if (!this.isPopupOpen()) {
      return;
    }

    const windowInstance = this._windowRef?.instance;
    if (!windowInstance) {
      return;
    }
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        windowInstance.next();
        this._showHint();
        break;
      case "ArrowUp":
        event.preventDefault();
        windowInstance.prev();
        this._showHint();
        break;
      case "Enter":
      case "Tab": {
        const result = windowInstance.getActive();
        if (result !== undefined && result !== null) {
          event.preventDefault();
          event.stopPropagation();
          this._selectResult(result);
        }
        this._closePopup();
        break;
      }
    }
  }

  private get _nativeElement(): HTMLInputElement {
    return toNativeElement(this.$element);
  }

  private _openPopup(): IPromise<void> {
    if (this.isPopupOpen()) return this.$q.resolve();
    if (this._openingPromise) return this._openingPromise;

    this._inputValueBackup = this._nativeElement.value;
    this._openingPromise = this._popupService
      .open()
      .then(({ windowRef }) => {
        this._windowRef = windowRef;
        windowRef.setInput("id", this.popupId);
        windowRef.setInput("popupClass", this.popupClass);
        windowRef.setInput("selectEvent", ({ $event }: { $event: any }) => this._selectResultClosePopup($event));
        windowRef.setInput("activeChangeEvent", ({ $event }: { $event?: string }) => {
          this.activeDescendant = $event ?? null;
          this._renderHostState();
        });

        const popupElement = windowRef.location.nativeElement;
        if (this.container === "body") {
          popupElement.style.zIndex = "1055";
          document.body.appendChild(popupElement);
        }

        this._renderHostState();
        this._changeDetector.markForCheck();

        this._ngZone.runOutsideAngular(() => {
          if (this._windowRef) {
            this._positioning.createPopper({
              hostElement: this._nativeElement,
              targetElement: popupElement,
              placement: this.placement ?? this._config.placement,
              updatePopperOptions: (options) =>
                (this.popperOptions ?? this._config.popperOptions)(addPopperOffset([0, 2])(options)),
            });
            this._watchPositioning();
          }
        });

        ngbAutoClose(
          this._ngZone,
          "outside",
          this._closed$,
          () => this.dismissPopup(),
          [popupElement],
          [this._nativeElement],
        );
      })
      .finally(() => {
        this._openingPromise = undefined;
      });

    return this._openingPromise;
  }

  private _closePopup(): void {
    this._popupService.close().subscribe(() => {
      this._positioning.destroy();
      this._unwatchPositioning?.();
      this._unwatchPositioning = undefined;
      this._closed$.next();
      this._windowRef = null;
      this.activeDescendant = null;
      this._renderHostState();
    });
  }

  private _selectResult(result: any): void {
    let defaultPrevented = false;
    this.selectItem?.({
      $event: {
        item: result,
        preventDefault: () => {
          defaultPrevented = true;
        },
      },
    });
    this._resubscribeTypeahead$.next(null);

    if (!defaultPrevented) {
      this.writeValue(result);
      this._onChange(result);
    }
  }

  private _selectResultClosePopup(result: any): void {
    this._selectResult(result);
    this._closePopup();
  }

  private _showHint(): void {
    const windowInstance = this._windowRef?.instance;
    if (this.showHint && windowInstance?.hasActive() && this._inputValueBackup != null) {
      const userInputLowerCase = this._inputValueBackup.toLowerCase();
      const formattedValue = this._formatItemForInput(windowInstance.getActive());

      if (userInputLowerCase === formattedValue.substring(0, this._inputValueBackup.length).toLowerCase()) {
        this._writeInputValue(this._inputValueBackup + formattedValue.substring(this._inputValueBackup.length));
        this._nativeElement.setSelectionRange(this._inputValueBackup.length, formattedValue.length);
      } else {
        this._writeInputValue(formattedValue);
      }
    }
  }

  private _formatItemForInput(item: any): string {
    return item != null && this.inputFormatter ? this.inputFormatter(item) : ngbToString(item);
  }

  private _writeInputValue(value: string): void {
    this._nativeElement.value = ngbToString(value);
  }

  private _subscribeToUserInput(): void {
    const results$ = this._valueChanges$.pipe(
      tap((value) => {
        this._inputValueBackup = this.showHint ? value : null;
        this._inputValueForSelectOnExact = this.selectOnExact ? value : null;
        this._ngZone.run(() => this._onChange(this.editable ? value : null));
      }),
      this.ngbTypeahead ? this.ngbTypeahead : () => of([]),
    );

    this._subscription = this._resubscribeTypeahead$.pipe(switchMap(() => results$)).subscribe(async (results) => {
      await this._ngZone.run(async () => {
        if (!results || results.length === 0) {
          this._closePopup();
        } else if (
          this.selectOnExact &&
          results.length === 1 &&
          this._formatItemForInput(results[0]) === this._inputValueForSelectOnExact
        ) {
          this._selectResult(results[0]);
          this._closePopup();
        } else {
          await this._openPopup();
          this._ngZone.run(() => {
            const windowRef = this._windowRef;
            if (!windowRef) {
              return;
            }
            windowRef.setInput("focusFirst", this.focusFirst);
            windowRef.setInput("results", results);
            windowRef.setInput("term", this._nativeElement.value);
            if (this.resultFormatter) {
              windowRef.setInput("formatter", this.resultFormatter);
            }
            if (this.resultTemplate) {
              windowRef.setInput("resultTemplate", this.resultTemplate);
            }
            windowRef.instance?.resetActive();
            windowRef.changeDetectorRef.detectChanges();
            this._showHint();
          });
        }

        const count = results ? results.length : 0;
        this._live.say(count === 0 ? "No results available" : `${count} result${count === 1 ? "" : "s"} available`);
      });
    });
  }

  private _unsubscribeFromUserInput(): void {
    this._subscription?.unsubscribe();
    this._subscription = null;
  }

  private _watchPositioning(): void {
    this._unwatchPositioning?.();
    this._unwatchPositioning = this.$scope.$watch(() => {
      if (this._windowRef) {
        this._positioning.update();
      }
    });
  }

  private _renderHostState(): void {
    this.$element.attr("autocomplete", this.autocomplete ?? "off");
    this.$element.attr("aria-autocomplete", this.showHint ? "both" : "list");
    this.$element.attr("aria-expanded", `${this.isPopupOpen()}`);

    if (this.isPopupOpen()) {
      this.$element.addClass("open");
      this.$element.attr("aria-controls", this.popupId);
    } else {
      this.$element.removeClass("open");
      this.$element.removeAttr("aria-controls");
    }

    if (this.activeDescendant) {
      this.$element.attr("aria-activedescendant", this.activeDescendant);
    } else {
      this.$element.removeAttr("aria-activedescendant");
    }
  }

  private readonly _handleBlurEvent = () => this._ngZone.run(() => this.handleBlur());
  private readonly _handleKeyDownEvent = (event: JQueryEventObject) =>
    this._ngZone.run(() => this.handleKeyDown(event));

  static get $inject() {
    return [
      "$element",
      "$scope",
      NgbTypeaheadConfig.$name,
      LiveService.$name,
      NgZone.$name,
      ChangeDetectorRef.$name,
      "$injector",
      ViewContainerRef.$name,
      NgbRTL.$name,
    ];
  }

  static get $name() {
    return "ngbTypeahead";
  }

  static get $factory(): () => IDirective {
    return () => ({
      bindToController: {
        autocomplete: "<?",
        container: "<?",
        editable: "<?",
        focusFirst: "<?",
        inputFormatter: "<?",
        ngbTypeahead: "<?",
        placement: "<?",
        popperOptions: "<?",
        popupClass: "<?",
        resultFormatter: "<?",
        resultTemplate: "<?",
        selectOnExact: "<?",
        showHint: "<?",
        selectItem: "&?",
      },
      controller: NgbTypeahead,
      require: {
        ngModelCtrl: "?ngModel",
      },
      restrict: "A",
      scope: true,
    });
  }
}
