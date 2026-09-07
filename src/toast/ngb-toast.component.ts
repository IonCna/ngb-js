import template from "@ngb/toast/ngb-toast.component.html";
import { NgbToastConfig } from "@ngb/toast/ngb-toast-config.service";
import { NgbToastHeader } from "@ngb/toast/ngb-toast-header.directive";
import { ngbToastFadeInTransition, ngbToastFadeOutTransition } from "@ngb/toast/ngb-toast-transition";
import { ngbRunTransition } from "@ngb/utils/transition/ngb-transition";
import {
  afterNextRender,
  Attribute,
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  HostBinding,
  inject,
  Input,
  NgZone,
  type OnChanges,
  Output,
  type SimpleChanges,
  TemplateRef,
  ViewChild,
} from "ngjs-core";
import type { Observable } from "rxjs";

export interface INgbToast {
  hide(): Observable<void>;
  show(): Observable<void>;
}

@Component({
  selector: "ngb-toast",
  exportAs: "ngbToast",
  template,
})
export class NgbToast implements OnChanges , INgbToast {
  private _config = inject(NgbToastConfig);
  private _zone = inject(NgZone);
  private _element = inject<ElementRef<HTMLElement>>(ElementRef);
  private _timeoutID?: ReturnType<typeof setTimeout> | null = null;

  @Input() animation = this._config.animation;
  @Input() delay = this._config.delay;
  @Input() autohide = this._config.autohide;
  @Input() header?: string;

  @ContentChild(NgbToastHeader, { read: TemplateRef, static: true })
  contentHeaderTpl?: TemplateRef<unknown> | null = null;

  @ViewChild("headerTpl", { read: TemplateRef, static: true })
  headerTpl!: TemplateRef<unknown>;

  @Output() shown = new EventEmitter<void>();
  @Output() hidden = new EventEmitter<void>();

  @HostBinding("attr.role") readonly _role = "alert";
  @HostBinding("attr.aria-atomic") readonly _ariaAtomic = "true";
  @HostBinding("class.toast") readonly _toast = true;

  @HostBinding("attr.aria-live")
  get _ariaLive(): string {
    return this.ariaLive;
  }

  @HostBinding("class.fade")
  get _fade(): boolean {
    return this.animation;
  }

  constructor(@Attribute("aria-live") public ariaLive: string) {
    this.ariaLive ??= this._config.ariaLive;
  }

  ngAfterContentInit() {
    afterNextRender(() => {
      this._init();
      this.show();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ("autohide" in changes) {
      this._clearTimeout();
      this._init();
    }
  }

  hide(): Observable<void> {
    this._clearTimeout();

    const transition = ngbRunTransition(this._zone, this._element.nativeElement, ngbToastFadeOutTransition, {
      animation: this.animation,
      runningTransition: "stop",
    });

    transition.subscribe(() => {
      this.hidden.emit();
    });
    return transition;
  }

  show(): Observable<void> {
    const transition = ngbRunTransition(this._zone, this._element.nativeElement, ngbToastFadeInTransition, {
      animation: this.animation,
      runningTransition: "continue",
    });

    transition.subscribe(() => {
      this.shown.emit();
    });
    return transition;
  }

  private _init(): void {
    if (this.autohide && !this._timeoutID) {
      this._timeoutID = setTimeout(() => this.hide(), this.delay);
    }
  }

  private _clearTimeout(): void {
    if (this._timeoutID) {
      clearTimeout(this._timeoutID);
      this._timeoutID = null;
    }
  }
}
