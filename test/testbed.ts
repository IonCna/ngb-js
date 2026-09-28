import type angular from "angular";
import { ApplicationRef, Injector } from "ngjs-core";
import { TestBed } from "ngjs-core/testing";

/**
 * Arranque de specs sobre el `TestBed` de `ngjs-core/testing`, para los specs que compilan
 * templates a mano con `$compile` (en vez de `TestBed.createComponent`).
 *
 * El injector del módulo de test ya trae el `ApplicationRef` (así `afterNextRender(...)`
 * de `NgbToast`, `NgbCarousel`, … se vacía con `detectChanges()`) y deja `inject()` andando
 * en los field initializers de los `@Injectable`.
 */
export interface NgbTestBed {
  readonly $injector: angular.auto.IInjectorService;
  readonly $compile: angular.ICompileService;
  readonly $rootScope: angular.IRootScopeService;
  /** Atajo tipado de `$injector.get`. */
  get<T>(token: string): T;
  /** Digest + flush de `afterNextRender` (como `fixture.detectChanges()`). */
  detectChanges(): void;
  /** Destruye el módulo de test. Llamar en `afterEach`. */
  destroy(): void;
}

/**
 * Configura `TestBed` con `feature` (una clase `@NgModule`, un `angular.IModule` como
 * `NgbModule`, o un nombre de módulo) y devuelve su injector ya instanciado.
 */
export async function configureTestBed(feature: Function | angular.IModule | string): Promise<NgbTestBed> {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ imports: [feature] });

  const $injector = TestBed.inject<angular.auto.IInjectorService>("$injector");
  const appRef = TestBed.inject(ApplicationRef);
  // Envuelto, no el `$injector` crudo: `Injector` resuelve también los tokens de clase.
  const injector = TestBed.inject(Injector);

  return {
    $injector,
    $compile: $injector.get<angular.ICompileService>("$compile"),
    $rootScope: $injector.get<angular.IRootScopeService>("$rootScope"),
    get: <T>(token: string) => injector.get<T>(token),
    detectChanges: () => appRef.tick(),
    destroy: () => {
      TestBed.resetTestingModule();
    },
  };
}
