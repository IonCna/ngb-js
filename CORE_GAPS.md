# Faltantes de `ngjs-core` encontrados durante la migracion

Este archivo registra diferencias comprobadas al portar `ng-bootstrap` a `ngb-js`.
No se implementan adaptadores dentro de la libreria para ocultarlas: el codigo se
mantiene cercano al original y puede quedar roto hasta que el core incorpore el
contrato correspondiente.

## API pendiente

| API de Angular usada por ng-bootstrap | Estado actual en `ngjs-core` | Features afectadas |
| --- | --- | --- |
| `ViewEncapsulation` | Decision: no se va a soportar (AngularJS no tiene scoped styles ni Shadow DOM real). El `styleUrl: './x.scss'` de upstream se compila a un `.css` **global** (prefijado con el selector del componente, como `ViewEncapsulation.None`) distribuido aparte — `src/tooltip/tooltip.css`, `src/datepicker/datepicker*.css`; el demo los toma con `@import` en `demo/style.css`. | Tooltip, typeahead, datepicker. |
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

### carousel (2026-09-08) — portado 1:1, en progreso (4/6)

`src/carousel/*` está portado **1:1 con `carousel.ts` de upstream** — `@Component`
(`NgbCarousel`) + `@Directive` (`NgbSlide`), `inject()`, `@ContentChildren`,
`@HostBinding`/`@HostListener`, `afterNextRender`, `takeUntilDestroyed`, ciclo de
vida Angular. Spec migrado a `configureTestBed`.

**Estado: 🟡 4/6.** Gaps encontrados:

| # | Upstream usa | Qué falta en `ngjs-core` | Resolución |
|---|---|---|---|
| A | `@ContentChildren` en un `@Component` cuyo template NO tiene `<ng-content>` | La query no veía el contenido transcluido si el template no lo proyectaba: AngularJS solo linkea el contenido cuando alguien invoca `$transclude()` (lo hacía `<ng-content>`). | **RESUELTO EN EL CORE (Opción 2 — proyección eager):** `content-projection-bridge.ts` transcluye+linkea el contenido de todo `@Component` con `transclude` al `$onInit`; `<ng-content>` pasa a mover ese clone ya vivo. Suite `ngjs-core` 575/575. |
| B | `inject(TemplateRef)` en `NgbSlide` (`@Directive` sobre `ng-template[ngbSlide]`) | 🔴 **No resuelto.** El `ngTemplate` es `transclude:'element'` → su controller queda en el nodo-comentario. Probado: en el constructor de la directiva `$element` es el `#comment`, `.controller('ngTemplate')`/`.data()`/`.inheritedData()` → `undefined`. `require: { ngTemplate: '?ngTemplate' }` + pre-link **sí** entrega el `TemplateRef` real, pero el constructor corre antes del link. | **WORKAROUND (patrón nav):** `NgbSlide` sin `inject(TemplateRef)`; `NgbCarousel` lo lee con `@ContentChildren(NgbSlide, { read: TemplateRef })` y lo asigna (`_bindSlideTemplates`). Fix real pendiente = B1-a (placeholder `TemplateRef` back-filleado en el pre-link) — no se hizo para no arriesgar el `transclude:'element'` existente. Le pega también a **nav**. |
| C | `@ContentChildren(NgbSlide)` corta en el borde de un componente anidado | 🔴 La query **cruza** hacia adentro de un `<ngb-carousel>` anidado. Angular frena la recolección en el borde de proyección de otro componente. | por diseñar |
| D | `ngAfterViewInit` con la vista renderizada | 🔴 El `lifecycle-bridge` lo reenvía a `$postLink`, que corre **antes** de que el `ng-repeat`/estructurales del template rendericen → el `querySelector` de los slides falla. | por diseñar |
| E | `@Input() id` / `@Input() activeId` string, síncrono antes de `ngAfterContentInit` | La traducción `@Input({ binding: "@" })` = `@?` de AngularJS resuelve la interpolación en el **siguiente** digest (`$observe`). Ventana con el valor default. | por diseñar (hoy no bloquea ningún test) |

Menores (ya conocidos, no bloquean): objeto `host` → `@HostBinding`/`@HostListener`;
`@for` → template AngularJS (`ng-repeat`); `NgbCarouselConfig` ya pasado a
`@Service()` + `NgbCarouselModule` a `@NgModule`.

### `PLATFORM_ID` / `isPlatformBrowser` (2026-09-08, AGREGADO AL CORE)

`carousel.ts` hace `inject(PLATFORM_ID)` + `isPlatformBrowser(this._platformId)`
(guarda SSR). `ngjs-core` corre siempre en el navegador. Agregado:
`PLATFORM_ID` (token con `factory: () => 'browser'`) en `core/platform`;
`isPlatformBrowser`/`isPlatformServer` en `common` (y `runtime/common`). La rama
browser se toma siempre.

### datepicker (2026-09-08) — port textual 1:1 con `datepicker/*` de upstream

Todos los archivos (`ngb-calendar`, `ngb-date`, `ngb-date-parser-formatter`,
`datepicker-config`, `datepicker-input-config`, `datepicker-i18n`,
`datepicker-service`, `datepicker-keyboard-service`, `datepicker-tools`,
`datepicker-view-model`, adapters, `datepicker.ts` → `ngb-datepicker.component` +
`ngb-datepicker-content` + `ngb-datepicker-month`, `datepicker-navigation`,
`datepicker-navigation-select`, `datepicker-day-view`, `datepicker-input`,
`datepicker.module`) portados con el **cuerpo de clase textual de upstream**.
Typecheck limpio. Gaps que forzaron desvío (además de los ya listados arriba —
`ViewEncapsulation`, `ChangeDetectionStrategy`, `NgModule.exports`,
`Component.imports`, `inject(TemplateRef)` en `<ng-template>`, `createComponent`
async, `NG_VALIDATORS`):

| # | Upstream | Gap ngjs-core | Adaptación |
|---|---|---|---|
| F | `@Injectable({ providedIn: 'root', useFactory: NGB_*_FACTORY })` sobre abstracta | `@Injectable` no tiene `useFactory` y `providedIn: 'root'` es **informativo** (no auto-registra — sólo `@Service`) | Se conservan los `NGB_*_FACTORY` y `@Injectable({ providedIn: 'root' })`; el `@NgModule` lista `{ provide: NgbCalendar, useFactory: NGB_DATEPICKER_CALENDAR_FACTORY }`, `useClass` para i18n, y los `providedIn:'root'` concretos (`NgbDatepickerConfig`, `NgbInputDatepickerConfig`, `NgbDatepickerKeyboardService`) en `providers`. |
| G | `host: { '(input)': 'manualDateChange($any($event).target.value)' }` | `@HostListener` **no evalúa expresiones de argumento** — siempre pasa el `event` crudo | Métodos wrapper `_handleInput(e)` / `_handleChange(e)` que extraen `.value`. |
| H | `@Input() get disabled() / set disabled(v)` | `bindToController` **pisa** el accessor de la clase | RESUELTO en `ngb-js`: se saca el `@Input()` del accessor; el estado `disabled` entra por el `control-value-accessor-bridge` (observa el atributo `disabled`, cubre forms) y por `inject(NgDisabled)` (`ng-disabled="expr"`). |
| I | `@ViewChild('x', { static: true })` disponible antes de `ngOnInit` | En ngjs-core resuelve en `$postLink` | `dayTemplate` fallback movido a `ngAfterContentInit`. |
| J | `takeUntilDestroyed()` (0-arg en contexto de inyección) | ngjs-core lo exige con `DestroyRef` explícito | `takeUntilDestroyed(this._destroyRef)`. |
| K | `new NgbDatepickerI18nDefault()` (upstream: `inject(LOCALE_ID)` en field) | `inject()` en field/ctor falla fuera de contexto DI (lo hace `NgbDatepickerService` y specs) | `constructor($locale?, $filter?)` con fallback a `inject('$locale'/'$filter')`. |
| L | `NgbDatepickerMonth` `inject(NgbDatepicker/NgbDatepickerService)` dentro de `<ng-template ngbDatepickerContent>` proyectado | Upstream lo cubre con `[ngTemplateOutletInjector]="injector"`. En ngjs-core la vista embebida se linkeaba **detached** → `$element.inheritedData('$ngjsInjector')` no veía el nodo del `<ngb-datepicker>`. | **RESUELTO EN EL CORE:** `EmbeddedViewRefImpl` acepta un `host` (`{ parent, anchor }`) y `NgTemplateOutlet` lo pasa → la vista embebida se linkea **en su posición real del DOM** (después del ancla del outlet) → la DI jerárquica, `require: '^^'` e `inheritedData` del contenido proyectado resuelven contra los ancestros reales. Automático, sin necesitar `ngTemplateOutletInjector`. ngjs-core 575/575, ngb-js datepicker 105/105. |
| M | `LOCALE_ID` + `formatDate` (`@angular/common`) | No provistos en módulo suelto | `$locale` / `$filter('date')` de AngularJS. |
| N | `styleUrl: './datepicker*.scss'` (5 archivos) | Sin `ViewEncapsulation` | Compilados a `src/datepicker/datepicker*.css` globales (prefijo por selector). `@import` en `demo/style.css`. |

**Divergencias que NO se pudieron mantener textuales** (upstream las provee por DI,
acá el `NgbDatepicker` sí las expone como métodos/inputs propios en el port viejo,
pero el textual NO): `NgbDatepicker` no tiene `processKey` ni `getMonth` públicos
(están en el service / `NgbDatepickerKeyboardService`); `calendar` no es `@Input`
(se provee `NgbCalendar` por DI). Los specs de `ngb-js` que usaban esa API
(`datepicker.processKey`, `datepicker.getMonth`, `<ngb-datepicker calendar=...>`)
quedan por reescribir.

## Reglas del port

- No modificar `ngjs-core` desde `ngb-js`.
- No agregar bindings manuales, wrappers o servicios de compatibilidad para cubrir
  APIs ausentes.
- Mantener templates sin cambios.
- Registrar aqui cada nuevo faltante confirmado antes de continuar con otro feature.

