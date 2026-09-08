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
| `ControlValueAccessor` y `NG_VALUE_ACCESSOR` | **Agregado al core** — `src/forms/` (interfaz + token) + `control-value-accessor-bridge.ts` (adapta CVA ↔ `ngModelController`). Ver abajo. | Rating, typeahead, timepicker, datepicker. |
| `@ViewChild(nombre, { read: ViewContainerRef })` sobre ancla sin controller | No resuelve (falta el `$viewContainerRefController`). Ver abajo. | accordion body (adaptado: `inject(ViewContainerRef)`). |
| `PLATFORM_ID` / `isPlatformBrowser` | **Agregado al core** — `PLATFORM_ID` (token, factory `() => 'browser'`) en `core/platform`; `isPlatformBrowser`/`isPlatformServer` en `common`. Siempre rama browser. | carousel. |
| `AfterContentChecked` / `AfterViewChecked` (interfaces) | **Agregado al core** — el `lifecycle-bridge` ya reenviaba los hooks a `$doCheck`; ahora las interfaces se exportan. | carousel. |

## Diferencias soportadas

### Creacion asincrona de componentes

`ViewContainerRef.createComponent()` es asincrono en `ngjs-core`. La migracion lo
conserva como tal: `PopupService.open()`, tooltip y typeahead usan promesas nativas
y `await`. El core integra estas promesas con el ciclo de digest, por lo que no se
usan `$q`, `$timeout` ni watchers como puentes.

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

### `@ViewChild(nombre, { read: ViewContainerRef })` sobre un ancla que no es componente (2026-09-07)

`ngjs-core` publica el `$viewContainerRefController` solo en elementos que TIENEN
un controller (lo pone `view-container-ref-bridge` en `augmentLocals`). Un
`<ng-container #container />` / `<span #container>` pelado no lo tiene, así que
`@ViewChild("container", { read: ViewContainerRef })` queda `undefined`.

ng-bootstrap v20 `NgbAccordionBody` usa ese patrón. **Adaptado en `ngb-js`**: el
body usa el `ViewContainerRef` de su propio host (`inject(ViewContainerRef)`) y el
template pasa a `<ng-content />` a secas — mismo efecto (la vista embebida queda
dentro del `.accordion-body`). Fix en el core: que `@ViewChild(read: ViewContainerRef)`
sintetice un VCR desde el nodo del candidato (como ya hace con `ElementRef`).

**Estado accordion:** ✅ **2/2** — migrado 1:1 a v20 (7 clases, un archivo por
directiva, `@Directive`/`@Component`, `inject()`, `@HostBinding`/`@HostListener`,
`@ContentChild(ren)`, `hostDirectives`, ciclo de vida Angular). Únicas
adaptaciones: `forwardRef` en el `@ContentChildren` (import circular) y el
`ViewContainerRef` del body por `inject` (arriba).

### `ControlValueAccessor` / `NG_VALUE_ACCESSOR` (2026-09-08, AGREGADO AL CORE)

Upstream `NgbRating`/`NgbTypeahead` implementan `ControlValueAccessor` y se
proveen como `NG_VALUE_ACCESSOR` (`{ provide: NG_VALUE_ACCESSOR, useExisting:
forwardRef(() => Self), multi: true }`).

**Agregado al core**:

- `src/forms/control-value-accessor.ts` — la interfaz.
- `src/forms/ng-value-accessor.ts` — `NG_VALUE_ACCESSOR` (`InjectionToken`,
  `multi`, sin `factory` → se resuelve por `ElementInjectorNode`).
- `src/runtime/bridges/control-value-accessor-bridge.ts` — decorador de
  `$controller`. Si la instancia cumple la forma CVA **y** declaró
  `NG_VALUE_ACCESSOR` en `providers`, en el `$postLink` conecta con el
  `ngModelController` del mismo elemento: `$render` → `writeValue`,
  `registerOnChange` → `$setViewValue` (vía `$evalAsync`), `registerOnTouched` →
  `$setTouched`, `setDisabledState` ← `$observe('disabled')` (cubre `ngDisabled`).

Sin `ngModel` en el elemento los métodos quedan dormidos (igual que Angular sin
directiva de formulario). Limitación: un `@Service` (como los config) no se puede
pisar por `providers` en un test — no aplica a CVA, pero es la misma restricción
de fondo. `ngb-js`: `src/typeahead/ngb-typeahead-cva.spec.ts` cubre el flujo.

### carousel (2026-09-08) — portado 1:1, ROJO por gaps del core

`src/carousel/*` está portado **1:1 con `carousel.ts` de upstream** — `@Component`
(`NgbCarousel`) + `@Directive` (`NgbSlide`), `inject()`, `@ContentChildren`,
`@HostBinding`/`@HostListener`, `afterNextRender`, `takeUntilDestroyed`, ciclo de
vida Angular. **Sin workarounds en `ngb-js`**. Spec migrado a `configureTestBed`.

**Estado: 🔴 0/6** — falla por gaps del core sin resolver (abajo). Se deja así a
propósito para que el diseño del fix se haga en el core, no acá.

Gaps que lo tiran (por diseñar):

| # | Upstream usa | Qué falta en `ngjs-core` | Le pega también a |
|---|---|---|---|
| A | `@ContentChildren(NgbSlide) slides` en un `@Component` cuyo template NO tiene `<ng-content>` | La query no ve el contenido transcluido si el template no lo proyecta (`ng-ref-bridge.ts` línea ~48: "Un `@Component` NO — su contenido va por `<ng-content>`"). Resultado: `slides` vacío → falla todo. | cualquier `@Component` con content queries y template sin `<ng-content>` |
| B | `inject(TemplateRef)` en `NgbSlide` (`@Directive` sobre `ng-template[ngbSlide]`) | Tira `no se encontró provider para "ngTemplate"`: el `ngTemplate` es `transclude: 'element'`, su controller queda en el nodo-comentario; `fromElementController` (`$element.controller('ngTemplate')`) no lo alcanza. (Hoy tapado por A.) | ya le pegó a **nav** (`NgbNavContent`, workaround con `{ read: TemplateRef }`) |
| C | `@ContentChildren(NgbSlide)` (descendants, corta en borde de componente) | La query **cruza** hacia adentro de un `<ngb-carousel>` anidado. Angular frena la recolección en el borde de proyección de otro componente. | cualquier `@ContentChildren` + anidamiento de componentes |
| D | `ngAfterViewInit` con la vista renderizada | El `lifecycle-bridge` lo reenvía a `$postLink`, que corre **antes** de que el `ng-repeat`/estructurales del template rendericen → el `querySelector` de los slides falla. | cualquier `@Component` que en `ngAfterViewInit` toque el DOM de su template |
| E | `@Input() id` / `@Input() activeId` string, aplicado síncrono antes de `ngAfterContentInit` | La traducción `@Input({ binding: "@" })` = `@?` de AngularJS resuelve la interpolación en el **siguiente** digest (`$observe`), no en el primer link. Ventana con el valor default. | cualquier `@Input` string leído en `ngOnInit`/`ngAfterContentInit` |

Menores (ya conocidos, no bloquean): objeto `host` → `@HostBinding`/`@HostListener`;
`@for` → template AngularJS (`ng-repeat`); `NgbCarouselConfig` ya pasado a
`@Service()` + `NgbCarouselModule` a `@NgModule`.

### `PLATFORM_ID` / `isPlatformBrowser` (2026-09-08, AGREGADO AL CORE)

`carousel.ts` hace `inject(PLATFORM_ID)` + `isPlatformBrowser(this._platformId)`
(guarda SSR). `ngjs-core` corre siempre en el navegador. Agregado:
`PLATFORM_ID` (token con `factory: () => 'browser'`) en `core/platform`;
`isPlatformBrowser`/`isPlatformServer` en `common` (y `runtime/common`). La rama
browser se toma siempre.

## Reglas del port

- No modificar `ngjs-core` desde `ngb-js`.
- No agregar bindings manuales, wrappers o servicios de compatibilidad para cubrir
  APIs ausentes.
- Mantener templates sin cambios.
- Registrar aqui cada nuevo faltante confirmado antes de continuar con otro feature.

