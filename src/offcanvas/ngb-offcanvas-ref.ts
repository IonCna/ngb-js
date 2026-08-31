import type { NgbOffcanvasBackdrop } from "@ngb/offcanvas/ngb-offcanvas-backdrop.component";
import type { NgbOffcanvasPanel } from "@ngb/offcanvas/ngb-offcanvas-panel.component";
import type { ContentRef } from "@ngb/utils/popup.service";
import type { IPromise, IQService } from "angular";
import angular from "angular";
import type { ComponentRef } from "ngjs-core";
import { of, Subject, takeUntil, zip } from "rxjs";

export class NgbActiveOffcanvas {
  close(_result?: any): void {}
  dismiss(_reason?: any): void {}
}

export class NgbOffcanvasRef {
  private readonly _resolve?: (result?: any) => void;
  private readonly _reject?: (reason?: any) => void;

  public result?: IPromise<any>;

  private readonly _hidden = new Subject<void>();
  private readonly _dismissed = new Subject<any>();
  private readonly _closed = new Subject<any>();

  constructor(
    private readonly $q: IQService,
    private panelRef: ComponentRef<NgbOffcanvasPanel>,
    private contentRef: ContentRef,
    private backdropRef?: ComponentRef<NgbOffcanvasBackdrop>,
    private readonly _beforeDismiss?: () => boolean | Promise<boolean>,
  ) {
    const deferred = this.$q.defer();

    this.result = deferred.promise;
    this._reject = deferred.reject;
    this._resolve = deferred.resolve;

    deferred.promise.then(angular.noop, angular.noop);

    if (this.panelRef.instance) {
      this.panelRef.instance.onDismiss = ({ $event }: { $event: any }) => this.dismiss($event);
    }

    if (this.backdropRef?.instance) {
      this.backdropRef.instance.onDismiss = ({ $event }: { $event: any }) => this.dismiss($event);
    }
  }

  dismiss(reason?: any) {
    if (!this.panelRef) return;
    if (!this._beforeDismiss) {
      this._dismiss(reason);
      return;
    }

    const dismiss = this._beforeDismiss();

    this.$q.when(dismiss).then((result) => {
      if (result !== false) this._dismiss(reason);
    }, angular.noop);
  }

  close(result?: any) {
    if (!this.panelRef) return;
    this._closed.next(result);
    this._resolve?.(result);
    this._removeOffcanvasElements();
  }

  private _dismiss(reason?: any) {
    this._dismissed.next(reason);
    this._reject?.(reason);
    this._removeOffcanvasElements();
  }

  get closed() {
    return this._closed.asObservable().pipe(takeUntil(this._hidden));
  }

  get dismissed() {
    return this._dismissed.asObservable().pipe(takeUntil(this._hidden));
  }

  get hidden() {
    return this._hidden.asObservable();
  }

  get shown() {
    return this.panelRef.instance?.shown.asObservable();
  }

  get componentInstance() {
    return this.contentRef.componentRef?.instance;
  }

  private _removeOffcanvasElements() {
    const panelTransition = this.panelRef.instance?.hide();
    const backdropTransition = this.backdropRef?.instance?.hide() ?? of(undefined);

    panelTransition?.subscribe(() => {
      angular.element(this.panelRef.location.nativeElement).remove();
      this.panelRef.destroy();

      this.contentRef.componentRef?.destroy();
      this.contentRef.viewRef?.destroy();
      this.panelRef = <any>null;
      this.contentRef = <any>null;
    });

    backdropTransition.subscribe(() => {
      if (!this.backdropRef) return;
      angular.element(this.backdropRef.location.nativeElement).remove();
      this.backdropRef.destroy();
      this.backdropRef = <any>null;
    });

    zip(panelTransition ?? of(undefined), backdropTransition).subscribe(() => {
      this._hidden.next();
      this._hidden.complete();
    });
  }
}
