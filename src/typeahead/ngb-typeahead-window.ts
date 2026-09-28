import { toString } from "@ngb/utils";
import { Component, EventEmitter, HostBinding, HostListener, Input, type OnInit, Output, type TemplateRef } from "ngjs-core";
// `id` como binding `@` (string literal): en el DOM `id="x"` es atributo nativo y
// `<?` lo parsearía como expresión. El directive lo pasa por `setInput`, que no
// parsea. Ver CORE_GAPS (`@Input` literal).

export interface ResultTemplateContext {
  result: any;
  term: string;
  formatter: (result: any) => string;
}

@Component({
  selector: "ngb-typeahead-window",
  exportAs: "ngbTypeaheadWindow",
  // Se crea de forma dinámica (`createComponent`), fuera de las `declarations` de
  // un módulo: necesita su propio `controllerAs` — el template usa `$.`.
  controllerAs: "$",
  template: `<ng-template ng-ref="rt" let-result="result" let-term="term" let-formatter="formatter">
    <ngb-highlight result="formatter(result)" term="term"></ngb-highlight>
</ng-template>

<button
        type="button"
        class="dropdown-item"
        role="option"
        ng-attr-id="{{ $.id + '-' + $index }}"
        ng-class="{ active: $index === $.activeIdx }"
        ng-mouseenter="$.markActive($index)"
        ng-click="$.select(result)"
        ng-repeat="result in $.results track by $index">
    <ng-container
            ng-template-outlet="$.resultTemplate || rt"
            ng-template-outlet-context="{ result: result, term: $.term, formatter: $.formatter }"
    ></ng-container>
</button>`,
})
export class NgbTypeaheadWindow implements OnInit {
  activeIdx = 0;

  @Input({ binding: "@" }) id!: string;
  @Input() focusFirst = true;
  @Input() results: any;
  @Input() term!: string;
  @Input() formatter = toString;
  @Input() resultTemplate!: TemplateRef<ResultTemplateContext>;
  @Input() popupClass!: string;

  @Output("select") selectEvent = new EventEmitter();
  @Output("activeChange") activeChangeEvent = new EventEmitter();

  @HostBinding("attr.role") readonly role = "listbox";
  @HostBinding("id") get hostId() {
    return this.id;
  }
  @HostBinding("class") get hostClass() {
    return `dropdown-menu show${this.popupClass ? ` ${this.popupClass}` : ""}`;
  }

  @HostListener("mousedown", ["$event"])
  onMouseDown(event: Event) {
    event.preventDefault();
  }

  hasActive() {
    return this.activeIdx > -1 && this.activeIdx < this.results.length;
  }

  getActive() {
    return this.results[this.activeIdx];
  }

  markActive(activeIdx: number) {
    this.activeIdx = activeIdx;
    this._activeChanged();
  }

  next() {
    if (this.activeIdx === this.results.length - 1) {
      this.activeIdx = this.focusFirst ? (this.activeIdx + 1) % this.results.length : -1;
    } else {
      this.activeIdx++;
    }
    this._activeChanged();
  }

  prev() {
    if (this.activeIdx < 0) {
      this.activeIdx = this.results.length - 1;
    } else if (this.activeIdx === 0) {
      this.activeIdx = this.focusFirst ? this.results.length - 1 : -1;
    } else {
      this.activeIdx--;
    }
    this._activeChanged();
  }

  resetActive() {
    this.activeIdx = this.focusFirst ? 0 : -1;
    this._activeChanged();
  }

  select(item: any) {
    this.selectEvent.emit(item);
  }

  ngOnInit() {
    this.resetActive();
  }

  private _activeChanged() {
    this.activeChangeEvent.emit(this.activeIdx >= 0 ? `${this.id}-${this.activeIdx}` : undefined);
  }
}
