# Faltantes de `ngjs-core` encontrados durante la migracion

Este archivo registra diferencias comprobadas al portar `ng-bootstrap` a `ngb-js`.
No se implementan adaptadores dentro de la libreria para ocultarlas: el codigo se
mantiene cercano al original y puede quedar roto hasta que el core incorpore el
contrato correspondiente.

## API pendiente

| API de Angular usada por ng-bootstrap | Estado actual en `ngjs-core` | Features afectadas |
| --- | --- | --- |
| `ViewEncapsulation` | Decision: no se va a soportar (AngularJS no tiene scoped styles ni Shadow DOM real). Sacado de los componentes afectados. | Tooltip, typeahead. |
| `ChangeDetectionStrategy.Eager` | Decision: no se va a soportar (AngularJS no tiene CD por componente). Sacado de la ventana de typeahead. | Ventana de typeahead. |
| `ControlValueAccessor` y `NG_VALUE_ACCESSOR` | No estan exportados por el core. | Rating y typeahead. |
| Providers de directiva compatibles con `NG_VALUE_ACCESSOR` | Falta el token y el flujo completo de forms. | Rating y typeahead. |

## Diferencias soportadas

### Creacion asincrona de componentes

`ViewContainerRef.createComponent()` es asincrono en `ngjs-core`. La migracion lo
conserva como tal: `PopupService.open()`, tooltip y typeahead usan promesas nativas
y `await`. El core integra estas promesas con el ciclo de digest, por lo que no se
usan `$q`, `$timeout` ni watchers como puentes.

### `@Service()`

Resuelto en `ngjs-core`: singleton implicito de toda la app via
`RootSingletonRegistry` (factory + cache propios, ya que AngularJS no deja
registrar un `.service()` nuevo despues del bootstrap). Sin DI por constructor
(se instancia con `new Clase()`; las dependencias se piden con `inject()` en
field initializers) y sin recetas de provider (`useClass`/`useFactory`) — para
eso sigue estando `@Injectable` + `providers`.

### `SimpleChange.firstChange`, `EventEmitter<T = any>`, `InjectionToken({ providedIn, factory })`

Resueltos en `ngjs-core`: `SimpleChange` ahora expone `firstChange` como
propiedad (ademas de `isFirstChange()`, que se mantiene); `EventEmitter`
default a `any` como Angular real (antes `void`); `InjectionToken` acepta
`providedIn: 'root'` (informativo — un `factory` ya se comporta como root
singleton exista o no la opcion, via `RootSingletonRegistry`).

### `afterEveryRender`/`afterNextRender` con fases y `{ injector }`

Resuelto en `ngjs-core`. `AfterRenderEventManager` ahora agrupa callbacks por
fase (`earlyRead`/`write`/`mixedReadWrite`/`read`) y las corre en ESE orden a
nivel de toda la app (todos los `earlyRead` registrados antes que cualquier
`write`, etc.) — no solo dentro de un mismo llamado. Un callback plano
equivale a `{ mixedReadWrite: callback }`. `afterNextRender` con varias fases
en el mismo spec las corre todas en el mismo render antes de desenganchar. La
opcion `{ injector }` resuelve el `AfterRenderEventManager` de ESE `Injector`
en vez de depender del contexto ambiente — usa `injector.get(...)` en vez de
`inject(...)`. Esto desbloquea `PopupService.open()` (el `afterNextRender`
con `{ injector: this._injector }` fuera de un contexto de inyeccion).

### `ViewContainerRef.createComponent(..., { injector: Injector })`

Resuelto en `ngjs-core`. `create-component.ts` sigue usando el `$injector`
nativo internamente (`.has`, servicios por nombre como `"$q"`/`"$compile"` —
no vale la pena reescribirlo contra la API publica), pero
`ViewContainerRef.createComponent`/`environmentInjector` ahora aceptan
tambien nuestro `Injector` publico y lo desenvuelven al `$injector` real
justo en el borde (`InjectorImpl.nativeInjector` + `unwrapAngularInjector`).
Desbloquea el `afterNextRender`/`createComponent` de `PopupService` con
`{ injector: this._injector }`.

### `NgModule.exports`

Decision: no se va a soportar. AngularJS registra directivas/componentes de
forma plana y global por `angular.module` — no hay concepto de "declaracion
privada al modulo salvo que se exporte" (todo lo que un modulo declara ya es
visible para cualquiera que dependa de el). Agregar `exports` solo para que
compile seria fingir una semantica de visibilidad que el runtime no aplica.
Sacado de `NgbTooltipModule`/`NgbTypeaheadModule` — `imports` alcanza.

### `Component.imports` para componentes standalone

Decision: no se va a soportar. En Angular real solo controla que selectors
reconoce el template de ESE componente (visibilidad de compilacion) — DI es
un mecanismo aparte (`providers`/`inject()`), no relacionado. AngularJS no
tiene visibilidad de template por componente (todo lo registrado en un
`angular.module` alcanzable es global a esa app), asi que no hay forma de
replicar la semantica real; solo se podria reinterpretar como "declaracion
transitiva" (mismo problema que "standalone dentro de `NgModule.imports`",
arriba). Sacado de `ngb-typeahead-window.ts` — `NgbHighlight` sigue
registrado via `NgbTypeaheadModule.declarations`; `NgTemplateOutlet` queda sin
registrar en ningun lado por ahora (mismo gap de standalone-imports, abajo).

### Directivas/componentes standalone dentro de `NgModule.imports`

Decision: no se va a soportar. `imports` de `NgModuleDef` solo resuelve
modulos (otra clase `@NgModule`, un `angular.IModule`, o un nombre de
modulo) — nunca clases standalone sueltas. `NgbTooltipModule` y
`NgbTypeaheadModule` pasaron `NgbTooltip`/`NgbHighlight`/`NgbTypeahead` de
`imports` a `declarations`, que es el campo correcto para registrar
componentes/directivas en un `@NgModule`. `NgTemplateOutlet` (usado en el
template de `ngb-typeahead-window`) queda sin registrar en ningun modulo por
ahora — pendiente aparte, no de este gap.

### Objeto Angular `host: { '[prop]': '...', '(event)': '...' }`

`ngjs-core` ya tenia esto cubierto via `@HostBinding`/`@HostListener` (no via
un objeto declarativo) — no era un gap del core. Se adapto `ngb-js`, no el
core: `ngb-typeahead-window.ts`, `ngb-tooltip-window.component.ts` y
`ngb-typeahead.directive.ts` reescriben cada entrada del objeto `host` como
`@HostBinding`/`@HostListener` (getters para expresiones, atributos estaticos
como propiedades `readonly`).

### `@Directive` + `@Input` + `ngOnInit` en el harness de specs (2026-09-07)

Con `bootstrapApplication` funcionan. Con el patron de las specs de `ngb-js`
(`angular.mock.module(NgbModule.name)` + `angular.mock.inject`) fallan:

- `ngOnInit` de una `@Directive` no dispara.
- Los `@Input` de una `@Directive` no se inicializan: AngularJS solo corre
  `initializeDirectiveBindings` para `bindToController` si `controller.identifier`
  esta seteado (= hay `controllerAs`). Las `@Directive` no lo tienen; Angular real
  no lo necesita. Candidato de fix en `ngjs-core`: `buildDirectiveDefinition`
  deberia darle identidad al controller aunque no haya `controllerAs`, o el
  binding path no deberia depender de eso.
- `@Injectable` con `inject()` en field initializer no alcanza el app injector
  desde `angular.mock.inject` (`_RootSingletonRegistry.getFromAppInjector`).

Decision pendiente con el usuario: arreglar el harness (bootstrap/TestBed real de
`ngjs-core` en las specs) y/o el fix de binding de `@Directive` en el core.
Ver `MIGRATION.md`.

### Varias `@Directive` con selector que normaliza al mismo nombre (2026-09-07)

ng-bootstrap usa varias directivas para el mismo atributo, distinguidas por
elemento o `:not()`:

- `[ngbNavItem]` + `[ngbNavItem]:not(ng-container)` (`NgbNavItem` / `NgbNavItemRole`)
- `[ngbNavLink]` + `a[ngbNavLink]` + `button[ngbNavLink]` (`NgbNavLinkBase` / `NgbNavLink` / `NgbNavLinkButton`)

En AngularJS las tres normalizan al mismo nombre (`ngbNavItem` / `ngbNavLink`) y
`ngjs-core` les pone `controller` a todas → `$compile:multidir` ("Multiple
directives asking for 'X' controller"). No hay forma en AngularJS de registrar
bajo un nombre y matchear por otro.

**Adaptado en `ngb-js`** (no el core): se fusionan en una sola directiva que
ramifica por `nativeElement.tagName`. Las clases sobrantes quedan como subclases
finas para compat de import, sin registrar. Un fix en el core tendría que
detectar el solapamiento y correr la lógica de las secundarias por `link` sin
reclamar el nombre del controller.

### Token `DOCUMENT` no es `providedIn: 'root'`

`inject(DOCUMENT)` (patrón de `NgbNav`, `NgbTooltip`, `NgbTypeahead`, `ScrollSpy`,
`Live`) tira `RootSingletonRegistry: no hay factory` salvo que el grafo importe
`PlatformBrowserModule` de `ngjs-core/platform-browser`. Se agregó a
`NgbRootModule.imports`. En Angular real `DOCUMENT` siempre está.

## Reglas del port

- No modificar `ngjs-core` desde `ngb-js`.
- No agregar bindings manuales, wrappers o servicios de compatibilidad para cubrir
  APIs ausentes.
- Mantener templates sin cambios.
- Registrar aqui cada nuevo faltante confirmado antes de continuar con otro feature.

