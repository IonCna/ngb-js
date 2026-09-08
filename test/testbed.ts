import type angular from "angular";
import { type ApplicationRef, bootstrapApplication, NgModule } from "ngjs-core";

/**
 * Arranque de specs equivalente a `TestBed.configureTestingModule` +
 * `ComponentFixture` de ng-bootstrap.
 *
 * `angular.mock.module(NgbModule.name)` a secas no alcanza: por esa vía `ngjs-core`
 * no cablea el `ApplicationRef`, así que `afterNextRender(...)` (que usan `NgbToast`,
 * `NgbCarousel`, …) nunca se vacía, y `inject()` en field initializers de
 * `@Injectable` no resuelve. Un `bootstrapApplication` real sobre un host detached
 * sí deja todo eso andando. Ver `MIGRATION.md`.
 */
export interface NgbTestBed {
	readonly $injector: angular.auto.IInjectorService;
	readonly $compile: angular.ICompileService;
	readonly $rootScope: angular.IRootScopeService;
	/** Atajo tipado de `$injector.get`. */
	get<T>(token: string): T;
	/** Digest + flush de `afterNextRender` (como `fixture.detectChanges()`). */
	detectChanges(): void;
	/** Destruye la app y saca el host del DOM. Llamar en `afterEach`. */
	destroy(): void;
}

/**
 * Bootstrapea `feature` (una clase `@NgModule`, un `angular.IModule` como
 * `NgbModule`, o un nombre de módulo) dentro de un `@NgModule` raíz de test y
 * devuelve su injector ya cableado.
 */
export async function configureTestBed(feature: Function | angular.IModule | string): Promise<NgbTestBed> {
	@NgModule({ imports: [feature as Function] })
	class TestRootModule {}

	const host = document.createElement("div");
	host.setAttribute("data-ngb-testbed", "");
	document.body.appendChild(host);

	const appRef = (await bootstrapApplication(TestRootModule, { hostElement: host })) as ApplicationRef;
	const $injector = appRef.injector;

	return {
		$injector,
		$compile: $injector.get<angular.ICompileService>("$compile"),
		$rootScope: $injector.get<angular.IRootScopeService>("$rootScope"),
		get: <T>(token: string) => $injector.get<T>(token),
		detectChanges: () => appRef.tick(),
		destroy: () => {
			appRef.destroy();
			host.remove();
		},
	};
}
