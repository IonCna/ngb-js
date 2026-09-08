import type { NgbOffcanvasBackdrop } from "@ngb/offcanvas/ngb-offcanvas-backdrop.component";
import type { NgbOffcanvasPanel } from "@ngb/offcanvas/ngb-offcanvas-panel.component";
import type { ContentRef } from "@ngb/utils/popup.service";
import { isPromise } from "@ngb/utils";
import angular from "angular";
import type { ComponentRef } from "ngjs-core";
import { type Observable, of, Subject, takeUntil, zip } from "rxjs";

/**
 * Referencia al offcanvas activo. Inyectable en el componente de contenido para
 * `.close()` / `.dismiss()` desde adentro.
 */
export class NgbActiveOffcanvas {
  close(_result?: unknown): void {}
  dismiss(_reason?: unknown): void {}
}

/**
 * Referencia al offcanvas recién abierto, devuelta por `NgbOffcanvas.open()`.
 */
export class NgbOffcanvasRef<T = unknown> {
  private readonly _hidden = new Subject<void>();
  private readonly _dismissed = new Subject<unknown>();
  private readonly _closed = new Subject<unknown>();
  private _resolve!: (result?: unknown) => void;
  private _reject!: (reason?: unknown) => void;

  /** Promise resuelta al cerrar, rechazada al descartar. */
  result: Promise<unknown>;

  constructor(
    private panelRef: ComponentRef<NgbOffcanvasPanel>,
    private contentRef: ContentRef,
    private backdropRef?: ComponentRef<NgbOffcanvasBackdrop>,
    private readonly _beforeDismiss?: () => boolean | Promise<boolean>,
  ) {
    this.result = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
    this.result.then(null, () => {});

    if (this.panelRef.instance) {
      this.panelRef.instance.onDismiss = ({ $event }: { $event: unknown }) => this.dismiss($event);
    }
    if (this.backdropRef?.instance) {
      this.backdropRef.instance.onDismiss = ({ $event }: { $event: unknown }) => this.dismiss($event);
    }
  }

  close(result?: unknown): void {
    if (!this.panelRef) return;
    this._closed.next(result);
    this._resolve(result);
    this._removeOffcanvasElements();
  }

  dismiss(reason?: unknown): void {
    if (!this.panelRef) return;
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

  private _dismiss(reason?: unknown): void {
    this._dismissed.next(reason);
    this._reject(reason);
    this._removeOffcanvasElements();
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

  get shown(): Observable<void> | undefined {
    return this.panelRef.instance?.shown.asObservable();
  }

  get componentInstance(): T | undefined {
    return this.contentRef.componentRef?.instance as T | undefined;
  }

  private _removeOffcanvasElements(): void {
    const panelTransition$ = this.panelRef.instance?.hide();
    const backdropTransition$ = this.backdropRef?.instance?.hide() ?? of(undefined);

    panelTransition$?.subscribe(() => {
      angular.element(this.panelRef.location.nativeElement).remove();
      this.panelRef.destroy();
      this.contentRef.componentRef?.destroy();
      this.contentRef.viewRef?.destroy();
      this.panelRef = null as never;
      this.contentRef = null as never;
    });

    backdropTransition$.subscribe(() => {
      if (!this.backdropRef) return;
      angular.element(this.backdropRef.location.nativeElement).remove();
      this.backdropRef.destroy();
      this.backdropRef = undefined;
    });

    zip(panelTransition$ ?? of(undefined), backdropTransition$).subscribe(() => {
      this._hidden.next();
      this._hidden.complete();
    });
  }
}
