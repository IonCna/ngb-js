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
| `@ViewChild(nombre, { read: ViewContainerRef })` sobre ancla sin controller | No resuelve (falta el `$viewContainerRefController`). Ver abajo. | accordion body (adaptado: `inject(ViewContainerRef)`). |

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

## Reglas del port

- No modificar `ngjs-core` desde `ngb-js`.
- No agregar bindings manuales, wrappers o servicios de compatibilidad para cubrir
  APIs ausentes.
- Mantener templates sin cambios.
- Registrar aqui cada nuevo faltante confirmado antes de continuar con otro feature.

