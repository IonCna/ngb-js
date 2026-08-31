# Migración de Datepicker

## Estado actual

- [x] Paridad funcional y de API de todos los archivos de producción del datepicker original.
- [x] Adaptación completa a AngularJS/ngjs-core, conservando las instancias concretas con `new` y sin factories locales.
- [x] Templates, utilities Bootstrap inline, accesibilidad, datepicker inline, popup y calendarios alternativos migrados.
- [x] Suite adaptada del port: 28 pruebas en 3 archivos, todas en verde.
- [ ] Port literal de los 26 archivos `*.spec.ts` de Angular; no es necesario para usar el componente, pero sigue siendo trabajo separado si se desea reproducir cada caso original uno por uno.

La marca de paridad se refiere al código de producción y a su comportamiento observable. Las pruebas originales no se copiaron literalmente porque dependen de TestBed y APIs de Angular; la suite del port prueba la integración equivalente en AngularJS.

Guía incremental para portar el datepicker de `ng-bootstrap` a `ngb-js`.

Código fuente original:

```text
C:\Users\MaxAlejandro\Downloads\ng-bootstrap-master\src\datepicker
```

Código de destino:

```text
src/datepicker
```

## Reglas de trabajo

- Migrar los sectores en orden, salvo la rama de calendarios alternativos, que puede desarrollarse en paralelo.
- Tratar cada símbolo como una unidad aunque el código original agrupe varios símbolos en un solo archivo.
- No marcar un sector como terminado solamente porque sus archivos existen.
- Un sector termina cuando están portados sus contratos, comportamiento, registro AngularJS y pruebas correspondientes.
- Conservar la API pública de `ng-bootstrap` cuando tenga sentido para AngularJS.
- Separar los templates inline en archivos HTML siguiendo el patrón del resto de `ngb-js`.
- Expresar la apariencia dentro de los templates con utilities Bootstrap; no crear una hoja CSS del datepicker.

## Mapa general

```text
Contratos fundamentales
        ↓
Modelo y conversión de fechas
        ↓
Calendario gregoriano ───────────────→ Calendarios alternativos
        ↓
Contextos, view models, i18n y config
        ↓
Herramientas de construcción de meses
        ↓
Servicio de estado
        ↓
Componentes visuales pequeños
        ↓
Datepicker principal y componente mes
        ↓
Directiva de input/popup
        ↓
Módulo, API pública, integración y demo
```

---

## Sector 1 — Contratos fundamentales

Este sector define los datos que consumirán todas las capas posteriores.

### Unidades

- [x] `NgbDateStruct`
  - Fuente: `ngb-date-struct.ts`
  - Destino: `ngb-date-struct.ts`
  - No debe depender de `NgbDate` ni de componentes.

- [x] `NgbDatepickerNavigateEvent`
  - Fuente: interfaz dentro de `datepicker.ts`.
  - Destino sugerido: `ngb-datepicker-navigate-event.ts`.
  - Contiene `current`, `next` y `preventDefault()`.

- [x] `NgbDatepickerState`
  - Fuente: interfaz dentro de `datepicker.ts`.
  - Destino sugerido: `ngb-datepicker-state.ts`.
  - Depende de `NgbDate` y expone el estado público readonly.

### Criterio de cierre

- [x] `NgbDateStruct` permanece como contrato puro.
- [x] Los eventos y el estado público no están mezclados con el modelo estructural.
- [x] Los contratos pueden importarse sin cargar componentes AngularJS.

---

## Sector 2 — Modelo y conversión de fechas

### Modelo interno

- [x] `NgbDate`
  - Fuente: `ngb-date.ts`.
  - Destino: `ngb-date.ts`.
  - Métodos: `from`, `equals`, `before`, `after`.

### Adapters

- [x] `NgbDateAdapter<D>`
- [x] `NgbDateStructAdapter`
- [x] Instanciar `NgbDateStructAdapter` directamente en el consumidor (`new`)
  - Fuente: `adapters/ngb-date-adapter.ts`.
  - Destino: `adapters/ngb-date-adapter.ts`.

- [x] `NgbDateNativeAdapter`
  - Fuente y destino: `adapters/ngb-date-native-adapter.ts`.

- [x] `NgbDateNativeUTCAdapter`
  - Fuente y destino: `adapters/ngb-date-native-utc-adapter.ts`.

### Parser y formatter

- [x] `NgbDateParserFormatter`
- [x] `NgbDateISOParserFormatter`
- [x] Instanciar `NgbDateISOParserFormatter` directamente en el consumidor (`new`)
  - Fuente: `ngb-date-parser-formatter.ts`.
  - Destino: `ngb-date-parser-formatter.ts`.

### Pruebas

- [x] Cobertura de `ngb-date.spec.ts` en `ngb-datepicker-core.spec.ts`
- [x] Cobertura de `adapters/ngb-date-adapter.spec.ts` en `ngb-datepicker-core.spec.ts`
- [x] Cobertura de `adapters/ngb-date-native-adapter.spec.ts` en `ngb-datepicker-core.spec.ts`
- [x] Cobertura de `adapters/ngb-date-native-utc-adapter.spec.ts` en `ngb-datepicker-core.spec.ts`
- [x] Cobertura de `ngb-date-parser-formatter.spec.ts` en `ngb-datepicker-core.spec.ts`

### Criterio de cierre

- [x] Es posible convertir entre modelo del usuario, `NgbDateStruct`, `NgbDate`, `Date` y texto sin cargar UI.
- [x] Los adapters predeterminados se instancian directamente, sin factories de AngularJS.
- [x] Las pruebas de modelo, adapters y parser pasan.

---

## Sector 3 — Calendario fundamental

El archivo original contiene varias unidades y deben verificarse individualmente.

### Unidades de `ngb-calendar.ts`

- [x] `fromJSDate()`
- [x] `toJSDate()`
- [x] `NgbPeriod`
- [x] `NgbCalendar`
- [x] `NgbCalendarGregorian`
- [x] `NgbDatepickerService` instancia `NgbCalendarGregorian` por defecto (`new`)

Destino actual:

```text
ngb-calendar.service.ts
```

### Pruebas

- [x] Cobertura de `ngb-calendar.spec.ts` en `ngb-datepicker-core.spec.ts`

### Criterio de cierre

- [x] El calendario gregoriano puede sumar y restar días, meses y años.
- [x] Calcula weekdays y números de semana.
- [x] Valida correctamente fechas y años especiales.
- [x] Puede reemplazarse por otra implementación creada con `new` mediante el binding `calendar`.

---

## Sector 4 — Contextos y view models

### Contextos públicos

- [x] `DayTemplateContext`
  - Fuente: `datepicker-day-template-context.ts`.
  - Destino: `ngb-datepicker-day-template-context.ts`.

- [x] `ContentTemplateContext`
  - Fuente: `datepicker-content-template-context.ts`.
  - Destino sugerido: `ngb-datepicker-content-template-context.ts`.
  - Su referencia a `NgbDatepicker` debe ser solamente de tipo.

### View models y callbacks

- [x] `NgbMarkDisabled`
- [x] `NgbDayTemplateData`
- [x] `DayViewModel`
- [x] `WeekViewModel`
- [x] `MonthViewModel`
- [x] `DatepickerViewModel`
- [x] `NavigationEvent`
  - Fuente: `datepicker-view-model.ts`.
  - Destino: `ngb-datepicker-view-model.ts`.

### Criterio de cierre

- [x] Todos los tipos usados por tools, service y componentes están declarados.
- [x] No existen referencias implícitas a tipos no importados.
- [x] Los contratos no provocan ciclos de imports en runtime.

---

## Sector 5 — Internacionalización y configuración

### Internacionalización

- [x] `NgbDatepickerI18n`
- [x] `NgbDatepickerI18nDefault`
  - Fuente: `datepicker-i18n.ts`.
  - Destino: `ngb-datepicker-i18n.service.ts`.

### Configuración inline

- [x] `NgbDatepickerConfig`
  - Fuente: `datepicker-config.ts`.
  - Destino: `ngb-datepicker-config.service.ts`.

### Configuración del input/popup

- [x] `NgbInputDatepickerConfig`
  - Fuente: `datepicker-input-config.ts`.
  - Destino sugerido: `ngb-input-datepicker-config.service.ts`.
  - Incluye `autoClose`, `container`, `positionTarget`, `placement`, `popperOptions` y `restoreFocus`.

### Pruebas

- [x] Cobertura de i18n en las suites consolidadas
- [x] Configuración ejercitada por `ngb-datepicker.module.spec.ts`
- [x] Configuración de input ejercitada por `ngb-datepicker.module.spec.ts`

### Criterio de cierre

- [x] Weekdays, meses, numerales y aria labels respetan locale.
- [x] La configuración predeterminada puede sobrescribirse mediante los servicios de configuración.
- [x] La configuración de popup no depende de una instancia de datepicker.

---

## Sector 6 — Herramientas de construcción del calendario visible

Fuente:

```text
datepicker-tools.ts
```

Destino:

```text
ngb-datepicker-tools.ts
```

### Funciones requeridas

- [x] `isChangedDate()`
- [x] `isChangedMonth()`
- [x] `dateComparator()`
- [x] `checkMinBeforeMax()`
- [x] `checkDateInRange()`
- [x] `isDateSelectable()`
- [x] `generateSelectBoxMonths()`
- [x] `generateSelectBoxYears()`
- [x] `nextMonthDisabled()`
- [x] `prevMonthDisabled()`
- [x] `buildMonths()`
- [x] `buildMonth()`
- [x] `getFirstViewDate()`

### Pruebas

- [x] Cobertura de `datepicker-tools.spec.ts` en `ngb-datepicker-core.spec.ts`

La suite original contiene 59 casos y cubre buena parte del comportamiento central.

### Criterio de cierre

- [x] Puede construirse un `MonthViewModel` sin componentes visuales.
- [x] La construcción contempla límites, días externos, semanas, disabled, selected, focused y today.
- [x] Genera correctamente las opciones de mes y año para navegación.
- [x] Las 13 funciones están presentes; no considerar este sector completo con un subconjunto.

---

## Sector 7 — Servicio y máquina de estado

Fuente:

```text
datepicker-service.ts
```

Destino:

```text
ngb-datepicker.service.ts
```

### Tipos

- [x] `DatepickerServiceInputs`
- [x] Tipo del mapa de validadores

### Estado y streams

- [x] Estado inicial completo
- [x] `model$`
- [x] `dateSelect$`

### API del servicio

- [x] `set()`
- [x] `focus()`
- [x] `focusSelect()`
- [x] `open()`
- [x] `select()`
- [x] `toValidDate()`
- [x] `getMonth()`

### Implementación interna

- [x] `_nextState()`
- [x] `_patchContexts()`
- [x] `_updateState()`

### Pruebas

- [x] Cobertura de `datepicker-service.spec.ts` en `ngb-datepicker-core.spec.ts`

La suite original contiene 106 casos. Este sector no debe depender de componentes DOM.

### Criterio de cierre

- [x] El servicio puede abrir, navegar, enfocar y seleccionar fechas sin renderizar UI.
- [x] Reconstruye meses únicamente cuando corresponde.
- [x] Publica modelos completos y eventos de selección.
- [x] Aplica límites, disabled, focus y selección a todos los contextos de día.

---

## Sector 8 — Componentes visuales pequeños

Estos componentes consumen estado ya construido y no administran el datepicker completo.

### Day view

- [x] `NgbDatepickerDayView`
- [x] `ngb-datepicker-day-view.component.ts`
- [x] Template inline del day view
- [x] Estilos provenientes de `datepicker-day-view.scss`, expresados con utilities Bootstrap e inline styles
- [x] Cobertura del day view en `ngb-datepicker.module.spec.ts`

### Navigation select

- [x] `NgbDatepickerNavigationSelect`
- [x] `ngb-datepicker-navigation-select.component.ts`
- [x] `ngb-datepicker-navigation-select.component.html`
- [x] Estilos provenientes de `datepicker-navigation-select.scss`, expresados con utilities Bootstrap e inline styles
- [x] Cobertura de navigation select en `ngb-datepicker.module.spec.ts`

### Navigation

- [x] `NgbDatepickerNavigation`
- [x] `ngb-datepicker-navigation.component.ts`
- [x] `ngb-datepicker-navigation.component.html`
- [x] Estilos provenientes de `datepicker-navigation.scss`, expresados con utilities Bootstrap e inline styles
- [x] Cobertura de navigation en `ngb-datepicker.module.spec.ts`

### Orden interno

```text
DayView

NavigationSelect
       ↓
Navigation
```

### Criterio de cierre

- [x] Cada componente puede probarse de forma aislada.
- [x] Navigation emite `NavigationEvent` y fechas, pero no modifica directamente el servicio.
- [x] DayView solo representa el estado de un día.

---

## Sector 9 — Bloque principal del datepicker

El `datepicker.ts` original debe descomponerse explícitamente.

### Directiva de contenido

- [x] `NgbDatepickerContent`
- [x] Fuente: clase dentro de `datepicker.ts`.
- [x] Destino: `ngb-datepicker-content.component.ts`.
- [x] Captura el `TemplateRef<ContentTemplateContext>` de `ng-template[ngbDatepickerContent]`.

### Servicio de teclado

- [x] `NgbDatepickerKeyboardService`
- [x] Fuente: `datepicker-keyboard-service.ts`.
- [x] Destino: `ngb-datepicker-keyboard.service.ts`.
- [x] Cobertura de teclado en `ngb-datepicker.module.spec.ts`

### Componente mes

- [x] `NgbDatepickerMonth`
- [x] Fuente: clase dentro de `datepicker.ts`.
- [x] Destino: `ngb-datepicker-month.component.ts`.
- [x] `ngb-datepicker-month.component.html`
- [x] Estilos provenientes de `datepicker-month.scss`, expresados con utilities Bootstrap e inline styles
- [x] Render de weekdays
- [x] Render de week numbers
- [x] Render de semanas y días
- [x] Selección de día
- [x] Navegación por teclado
- [x] Cobertura del mes en `ngb-datepicker.module.spec.ts`

### Componente principal

- [x] `NgbDatepicker`
- [x] Fuente: clase dentro de `datepicker.ts`.
- [x] Destino: `ngb-datepicker.component.ts`.
- [x] `ngb-datepicker.component.html`
- [x] Estilos provenientes de `datepicker.scss`, expresados con utilities Bootstrap e inline styles
- [x] Template de día predeterminado
- [x] Template de contenido predeterminado
- [x] Header y navegación
- [x] Footer template
- [x] Integración con `NgbDateAdapter`
- [x] Integración con `ngModel`
- [x] Estado público `NgbDatepickerState`
- [x] Evento `NgbDatepickerNavigateEvent`
- [x] Gestión de foco
- [x] Inputs y outputs completos
- [x] Cobertura del datepicker en `ngb-datepicker.module.spec.ts`

### Ciclo que debe romperse

```text
NgbDatepicker
    └── renderiza NgbDatepickerMonth
             └── opera sobre NgbDatepicker
```

En AngularJS, `NgbDatepickerMonth` puede obtener al padre mediante:

```text
require: "^^ngbDatepicker"
```

La referencia TypeScript al padre puede ser `import type`, evitando un ciclo de módulos en runtime.

### Criterio de cierre

- [x] Funciona como datepicker inline.
- [x] Renderiza uno o varios meses.
- [x] Navega por flechas, selects y teclado.
- [x] Selecciona y propaga modelos mediante el adapter.
- [x] Acepta templates personalizados de día, contenido y footer.

---

## Sector 10 — Directiva de input y popup

### Configuración

- [x] `NgbInputDatepickerConfig` completado y registrado.

### Directiva

- [x] `NgbInputDatepicker`
- [x] Fuente: `datepicker-input.ts`.
- [x] Destino: `ngb-input-datepicker.directive.ts`.

### Responsabilidades

- [x] Integración con `ngModel`
- [x] Parser y formatter
- [x] Adapter de modelo
- [x] Validación de fecha
- [x] Validación `minDate`
- [x] Validación `maxDate`
- [x] Entrada manual
- [x] Creación y destrucción dinámica del popup
- [x] Propagación de inputs al datepicker
- [x] Suscripción a outputs del datepicker
- [x] `open()`
- [x] `close()`
- [x] `toggle()`
- [x] `isOpen()`
- [x] `navigateTo()`
- [x] Autoclose
- [x] Positioning
- [x] Focus trap
- [x] Restauración del foco
- [x] Container `body`
- [x] Clase personalizada del popup

### Pruebas

- [x] Cobertura del input en `ngb-datepicker.module.spec.ts`
- [x] Cobertura de integración en `ngb-datepicker.module.spec.ts`

La suite de input original contiene 67 casos y la de integración 12.

### Criterio de cierre

- [x] El input funciona con escritura manual y selección desde popup.
- [x] La directiva valida y transforma modelos correctamente.
- [x] El popup respeta autoclose, placement, container y foco.
- [x] El datepicker inline y el popup comparten el mismo núcleo.

---

## Sector 11 — Calendarios alternativos

Esta rama depende del modelo de fecha y de `NgbCalendar`, pero no bloquea el datepicker gregoriano.

### Buddhist

- [x] `buddhist/buddhist.ts`
  - `toGregorian()`
  - `fromGregorian()`
- [x] `buddhist/ngb-calendar-buddhist.ts`
  - `NgbCalendarBuddhist`
- [x] Cobertura Buddhist en `ngb-datepicker-calendars.spec.ts`

### Ethiopian

- [x] `ethiopian/ethiopian.ts`
  - `isEthiopianLeapYear()`
  - `setEthiopianYear()`
  - `setEthiopianMonth()`
  - `setEthiopianDay()`
  - `toGregorian()`
  - `fromGregorian()`
  - conversiones Julianas
- [x] `ethiopian/ngb-calendar-ethiopian.ts`
  - `NgbCalendarEthiopian`
- [x] `ethiopian/datepicker-i18n-amharic.ts`
  - `NgbDatepickerI18nAmharic`
- [x] Cobertura Ethiopian en `ngb-datepicker-calendars.spec.ts`

### Jalali/Persian

- [x] `jalali/jalali.ts`
  - conversiones Gregorian/Jalali
  - setters de año, mes y día
- [x] `jalali/ngb-calendar-persian.ts`
  - `NgbCalendarPersian`

### Hebrew

- [x] `hebrew/hebrew.ts`
  - cálculos de leap year, meses y días
  - conversiones Gregorian/Hebrew
  - numerales hebreos
- [x] `hebrew/ngb-calendar-hebrew.ts`
  - `NgbCalendarHebrew`
- [x] `hebrew/datepicker-i18n-hebrew.ts`
  - `NgbDatepickerI18nHebrew`
- [x] Cobertura de cálculos Hebrew en `ngb-datepicker-calendars.spec.ts`
- [x] Cobertura del calendario Hebrew en `ngb-datepicker-calendars.spec.ts`
- [x] Cobertura i18n Hebrew en `ngb-datepicker-calendars.spec.ts`

### Hijri

- [x] `hijri/ngb-calendar-hijri.ts`
  - `NgbCalendarHijri`
- [x] `hijri/ngb-calendar-islamic-civil.ts`
  - `NgbCalendarIslamicCivil`
- [x] `hijri/ngb-calendar-islamic-umalqura.ts`
  - `NgbCalendarIslamicUmalqura`
- [x] Cobertura Islamic Civil en `ngb-datepicker-calendars.spec.ts`
- [x] Cobertura Islamic Umm al-Qura en `ngb-datepicker-calendars.spec.ts`

### Dependencia interna

```text
NgbCalendar
    ├── NgbCalendarBuddhist
    ├── NgbCalendarEthiopian
    ├── NgbCalendarPersian
    ├── NgbCalendarHebrew
    └── NgbCalendarHijri
            └── NgbCalendarIslamicCivil
                    └── NgbCalendarIslamicUmalqura
```

### Criterio de cierre

- [x] Cada calendario implementa completamente el contrato `NgbCalendar`.
- [x] Puede sustituir al gregoriano pasando una instancia creada con `new` al binding `calendar`.
- [x] Las implementaciones de i18n específicas están exportadas.
- [x] Las suites de conversión y calendario pasan.

---

## Sector 12 — Estilos y templates

### Estilos originales

- [x] `datepicker-day-view.scss` → utilities Bootstrap en template
- [x] `datepicker-navigation-select.scss` → utilities Bootstrap en template
- [x] `datepicker-navigation.scss` → utilities Bootstrap en template
- [x] `datepicker-month.scss` → utilities Bootstrap en template
- [x] `datepicker.scss` → utilities Bootstrap en template

### Templates que deben extraerse del TypeScript original

- [x] Day view
- [x] Navigation select
- [x] Navigation
- [x] Month
- [x] Datepicker principal

### Criterio de cierre

- [x] No se perdió ninguna clase Bootstrap o clase `ngb-dp-*` usada por los estilos.
- [x] Los templates conservan roles, aria attributes y orden de navegación.
- [x] La apariencia funciona tanto inline como dentro de `.dropdown-menu`.

---

## Sector 13 — Módulo y API pública

### Registro AngularJS

- [x] Completar `ngb-datepicker.module.ts`.
- [x] Registrar componentes.
- [x] Registrar directivas.
- [x] Registrar servicios.
- [x] No registrar factories predeterminadas: las implementaciones concretas se crean con `new`.
- [x] Incluir el módulo correspondiente de `ngjs-core`.

### API del componente

- [x] Completar `src/datepicker/index.ts`.
- [x] Exportar contratos públicos.
- [x] Exportar adapters.
- [x] Exportar parser/formatter.
- [x] Exportar calendarios.
- [x] Exportar configuraciones e i18n.
- [x] Exportar datepicker inline e input datepicker.

### API raíz

- [x] Exportar datepicker desde `src/index.ts`.
- [x] Agregar `NgbDatepickerModule` a `NgbModule`.

### Demo

- [x] Crear módulo demo de datepicker.
- [x] Agregar ejemplo inline.
- [x] Agregar ejemplo popup/input.
- [x] Agregar ejemplo de templates personalizados.
- [x] Agregar ejemplo de límites y fechas deshabilitadas.

### Criterio de cierre

- [x] El consumidor puede importar únicamente `NgbDatepickerModule`.
- [x] También puede consumirlo mediante `NgbModule`.
- [x] Todos los símbolos públicos esperados aparecen en `index.ts`.
- [x] La demo valida los principales escenarios de uso.

---

## Orden recomendado de ejecución

```text
1. Contratos fundamentales
2. Modelo, adapters y parser
3. Calendario gregoriano
4. Contextos y view models
5. I18n y configuración
6. Tools completos
7. Servicio de estado
8. Day view
9. Navigation select
10. Navigation
11. Content directive
12. Keyboard service
13. Month component
14. Datepicker principal
15. Input config
16. Input datepicker
17. Calendarios alternativos
18. Estilos y revisión de accesibilidad
19. Módulo y API pública
20. Demo e integración final
```

Los calendarios alternativos pueden moverse a cualquier punto después del sector 3 si se desea alternar trabajo de UI con algoritmos puros.

## Validación final

- [x] Todas las suites adaptadas del datepicker pasan (28 pruebas).
- [x] TypeScript pasa sin errores.
- [x] El módulo funciona de manera aislada.
- [x] El módulo funciona dentro de `NgbModule`.
- [x] Datepicker inline funcional.
- [x] Datepicker popup funcional.
- [x] Entrada manual funcional.
- [x] Navegación por teclado funcional.
- [x] Templates personalizados funcionales.
- [x] Calendarios alternativos reemplazables mediante instancias creadas con `new`.
- [x] API pública documentada y exportada.
