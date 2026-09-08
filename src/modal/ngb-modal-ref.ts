import type { NgbModalBackdrop } from "@ngb/modal/ngb-modal-backdrop.component";
import type { NgbModalUpdatableOptions } from "@ngb/modal/ngb-modal-config.service";
import type { NgbModalWindow } from "@ngb/modal/ngb-modal-window.component";
import { isPromise } from "@ngb/utils";
import type { ContentRef } from "@ngb/utils/popup.service";
import angular from "angular";
import type { ComponentRef } from "ngjs-core";
import { type Observable, of, Subject, zip } from "rxjs";
import { takeUntil } from "rxjs/operators";

/**
 * Referencia al modal abierto (activo). Inyectable en el componente de contenido
 * para `.update()` / `.close()` / `.dismiss()` desde adentro.
 */
export class NgbActiveModal {
  update(_options: NgbModalUpdatableOptions): void {}
  close(_result?: unknown): void {}
  dismiss(_reason?: unknown): void {}
}

/**
 * Referencia al modal recién abierto, devuelta por `NgbModal.open()`.
 */
export class NgbModalRef<T = unknown> {
  private _closed = new Subject<unknown>();
  private _dismissed = new Subject<unknown>();
  private _hidden = new Subject<void>();
  private _resolve!: (result?: unknown) => void;
  private _reject!: (reason?: unknown) => void;

  /** Promise resuelta al cerrar, rechazada al descartar. */
  result: Promise<unknown>;

  update(options: NgbModalUpdatableOptions): void {
    this._windowCmptRef.instance.updateOptions(options);
    if (this._backdropCmptRef?.instance) {
      this._backdropCmptRef.instance.updateOptions(options);
    }
  }

  get componentInstance(): T | undefined {
    return this._contentRef?.componentRef?.instance as T | undefined;
  }

  get closed(): Observable<unknown> {
    return this._closed.asObservable().pipe(takeUntil(this._hidden));
  }

  get dismissed(): Observable<unknown> {
    return this._dismissed.asObservable().pipe(takeUntil(this._hidden));
  }

  get hidden(): Observable<void> {
    return this._hidden.asObservable();
  }

  get shown(): Observable<void> {
    return this._windowCmptRef.instance.shown.asObservable();
  }

  constructor(
    private _windowCmptRef: ComponentRef<NgbModalWindow>,
    private _contentRef: ContentRef,
    private _backdropCmptRef?: ComponentRef<NgbModalBackdrop>,
    private _beforeDismiss?: () => boolean | Promise<boolean>,
  ) {
    _windowCmptRef.instance.dismissEvent.subscribe((reason: unknown) => this.dismiss(reason));

    this.result = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
    this.result.then(null, () => {});
  }

  close(result?: unknown): void {
    if (this._windowCmptRef) {
      this._closed.next(result);
      this._resolve(result);
      this._removeModalElements();
    }
  }

  private _dismiss(reason?: unknown) {
    this._dismissed.next(reason);
    this._reject(reason);
    this._removeModalElements();
  }

  dismiss(reason?: unknown): void {
    if (!this._windowCmptRef) return;
    if (!this._beforeDismiss) {
      this._dismiss(reason);
      return;
    }
    const dismiss = this._beforeDismiss();
    if (isPromise(dismiss)) {
      dismiss.then(
        (result) => {
          if (result !== false) this._dismiss(reason);
        },
        () => {},
      );
    } else if (dismiss !== false) {
      this._dismiss(reason);
    }
  }

  private _removeModalElements() {
    const windowTransition$ = this._windowCmptRef.instance.hide();
    const backdropTransition$ = this._backdropCmptRef ? this._backdropCmptRef.instance.hide() : of(undefined);

    windowTransition$.subscribe(() => {
      angular.element(this._windowCmptRef.location.nativeElement).remove();
      this._windowCmptRef.destroy();
      this._contentRef?.componentRef?.destroy();
      this._contentRef?.viewRef?.destroy();
      this._windowCmptRef = null as never;
      this._contentRef = null as never;
    });

    backdropTransition$.subscribe(() => {
      if (this._backdropCmptRef) {
        angular.element(this._backdropCmptRef.location.nativeElement).remove();
        this._backdropCmptRef.destroy();
        this._backdropCmptRef = undefined;
      }
    });

    zip(windowTransition$, backdropTransition$).subscribe(() => {
      this._hidden.next();
      this._hidden.complete();
    });
  }
}
