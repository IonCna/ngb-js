import template from "@ngb/alert/ngb-alert.component.html";
import { NgbAlertConfig } from "@ngb/alert/ngb-alert-config.service";
import { ngbAlertFadingTransition } from "@ngb/alert/ngb-alert-transition";
import { ngbRunTransition } from "@ngb/utils/transition/ngb-transition";
import { Component, ElementRef, EventEmitter, HostBinding, inject, Input, NgZone, Output } from "ngjs-core";
import type { Observable } from "rxjs";

export interface INgbAlert {
  close(): Observable<void>;
}

@Component({
  selector: "ngb-alert",
  exportAs: "ngbAlert",
  template,
})
export class NgbAlert implements INgbAlert {
  private readonly _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly _config = inject(NgbAlertConfig);
  private readonly _zone = inject(NgZone);

  @Input() animation = this._config.animation;
  @Input() dismissible = this._config.dismissible;
  @Input() type = this._config.type;
  @Output() closed = new EventEmitter<void>();

  @HostBinding("attr.role") readonly _role = "alert";
  @HostBinding("class.d-block") readonly _block = true;

  @HostBinding("class")
  get _hostClass(): string {
    return `alert show${this.type ? ` alert-${this.type}` : ""}`;
  }

  @HostBinding("class.fade")
  get _fade(): boolean {
    return this.animation;
  }

  @HostBinding("class.alert-dismissible")
  get _dismissibleClass(): boolean {
    return this.dismissible;
  }

  close(): Observable<void> {
    const transition = ngbRunTransition(this._zone, this._elementRef.nativeElement, ngbAlertFadingTransition, {
      animation: this.animation ?? this._config.animation,
      runningTransition: "continue",
    });

    transition.subscribe(() => {
      this.closed.emit();
    });

    return transition;
  }
}
