# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Build (esbuild bundler via Bun)
bun run build

# Run tests (Vitest, no script defined — run directly)
bunx vitest

# Run a single test file
bunx vitest src/alert/ngb-alert.component.spec.ts
```

> Note: tests use `tsconfig.spec.json` which includes `test/setup.ts` as a setup file.

## Architecture

**ngb-js** is a port of ng-bootstrap (Angular Bootstrap) to the AngularJS (1.x)
ecosystem, running on top of **`ngjs-core`** — a sibling package that
reimplements the `@angular/core` surface (`@Component`, `@Directive`, `@Input`,
`@Output`, DI, lifecycle hooks, queries, `ChangeDetectorRef`, etc.) as a runtime
layer over AngularJS, with no build step and no template compiler. Component
source is meant to be as close to a textual copy of upstream ng-bootstrap as
`ngjs-core`'s API surface allows — see `CORE_GAPS.md` for the documented,
deliberate deviations (and why).

- `src/index.ts` — main entry point; exports all components and services
- `src/ngb.module.ts` — root `NgbModule` (an `ngjs-core` `@NgModule`) that
  aggregates all sub-modules
- `src/config/` — `NgbConfig`, the global defaults service
- `demo/` — local demo app that consumes the library

### Component structure

Each component lives in its own directory under `src/` and follows this pattern:

```
src/alert/
├── index.ts                      # Re-exports for consumers
├── ngb-alert.module.ts           # @NgModule registration
├── ngb-alert.component.ts        # @Component class
├── ngb-alert.component.html      # Template (imported as string)
├── ngb-alert-config.service.ts   # @Service holding defaults (paridad con NgbAlertConfig upstream)
├── ngb-alert-transition.ts       # Animation logic
└── ngb-alert.component.spec.ts   # Vitest unit test (via configureTestBed)
```

### `ngjs-core` decorator pattern (not classic AngularJS)

Components/directives are plain classes decorated with the real `@angular/core`-shaped
decorators, DI via `inject()` in field initializers (no constructor injection,
no `$inject` arrays), same as upstream ng-bootstrap:

```typescript
@Component({ selector: "ngb-alert", exportAs: "ngbAlert", template })
export class NgbAlert implements INgbAlert {
  private readonly _config = inject(NgbAlertConfig);

  @Input() animation = this._config.animation;
  @Output() closed = new EventEmitter<void>();

  @HostBinding("class.fade") get _fade(): boolean { return this.animation; }

  ngOnInit(): void { /* ... */ }
}
```

**Templates** — HTML files are imported as ES module strings (`import template from "*.html"`). esbuild resolves these.

**Lifecycle hooks** — Angular-style (`ngOnInit`, `ngOnChanges`, `ngAfterViewInit`, `ngOnDestroy`, ...), not AngularJS's `$onInit`/`$postLink`.

**Bindings** — `@Input()` defaults to AngularJS `<?` (one-way expression, evaluated) under the hood; `@Input({ binding: "@" })` opts into AngularJS `@?` (raw string/interpolation) **only** for inputs that are always plain strings (`placement`, `type`, `tooltipClass`, ...) — never for inputs that can hold a number, array, or object (those MUST stay on the default `<`, or the value silently degrades to its literal string text). See `src/core/metadata/input.ts` in `ngjs-core` and the `NgbNavItem`/`NgbScrollSpyItem` vs. `NgbScrollSpyFragment` split for a concrete example of the boundary.

**Services** — `@Service()` (app-wide implicit singleton, like `providedIn: 'root'` — auto-registers, never goes in `providers: [...]`) or `@Injectable()` + explicit `providers: [...]` (per-module/per-component). `inject()` and `ngjs-core`'s `Injector.get()` resolve either; the raw AngularJS `$injector` only sees `@Injectable`-via-providers registrations, not `@Service` (which lives in `ngjs-core`'s `RootSingletonRegistry`) — test code must use the wrapped `Injector`, never `$injector.get(name)` directly, to fetch a `@Service`.

### Shared utilities (`src/utils/`)

| Module | Purpose |
|---|---|
| `transition/` | CSS transition runner (`ngbRunTransition`) |
| `accessibility/` | ARIA live region service (`LiveService`) |
| `positioning.ts` | Popper.js wrapper |
| `focus-trap.ts` | Modal focus trapping |
| `autoclose.ts` | Click-outside / escape-key autoclose |
| `triggers.ts` | Generic hover/focus/click trigger logic |
| `rtl.service.ts` | RTL direction detection (`NgbRTL`) |

### Test setup

Tests use **Vitest** with `jsdom` environment and `angular-mocks`. The shim at `test/test-framework-shim.ts` bridges Vitest's `beforeEach`/`afterEach` to the window globals that `angular-mocks` expects.

Typical test pattern — `test/testbed.ts`'s `configureTestBed` (equivalent to Angular's `TestBed.configureTestingModule` + `ComponentFixture`), not raw `angular.mock.module`/`angular.mock.inject`:

```typescript
import { configureTestBed, type NgbTestBed } from "../../test/testbed";
import { NgbModule } from "@ngb/ngb.module";

let tb: NgbTestBed;

beforeEach(async () => {
    tb = await configureTestBed(NgbModule);
    // tb.$compile, tb.$rootScope, tb.get<T>(token), tb.detectChanges(), tb.destroy()
});

afterEach(() => tb.destroy());
```

### Path aliases

Defined in `tsconfig.json`:
- `@ngb/*` → `src/*`
- `@demo/*` → `demo/*`
