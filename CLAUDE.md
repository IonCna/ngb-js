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

> Note: `esbuild.config.ts` has `entryPoints: []` — the build is a work in progress. Tests use `tsconfig.spec.json` which includes `test/setup.ts` as a setup file.

## Architecture

**ngb-js** is an AngularJS 1.8 Bootstrap 5 UI component library written in TypeScript. It mirrors ng-bootstrap's API but targets the AngularJS (1.x) ecosystem.

- `src/index.ts` — main entry point; exports all components and services
- `src/ngb.module.ts` — root `NgbModule` that aggregates all sub-modules
- `demo/` — local demo app that consumes the library

### Component structure

Each component lives in its own directory under `src/` and follows this pattern:

```
src/alert/
├── index.ts                      # Re-exports for consumers
├── ngb-alert.module.ts           # angular.module() registration
├── ngb-alert.component.ts        # Controller class
├── ngb-alert.component.html      # Template (imported as string)
├── ngb-alert-config.service.ts   # Service that holds defaults
├── ngb-alert-transition.ts       # Animation logic
└── ngb-alert.component.spec.ts   # Vitest unit test
```

### AngularJS conventions used throughout

**Controller class pattern** — every component/directive/service class exposes static getters:

```typescript
class NgbAlert implements IComponentController {
    static get $name()    { return "ngbAlert" }        // registration key
    static get $inject()  { return ["$element", ...] } // DI tokens
    static get $factory() { return { bindings: {...}, controller: NgbAlert, template } } // IComponentOptions
}
```

**Module registration** — each `*.module.ts` creates an `angular.module()` and calls `.component()`, `.service()`, etc. using the static getters above.

**Templates** — HTML files are imported as ES module strings (`import template from "*.html"`). esbuild resolves these.

**Lifecycle hooks** — use `$onInit()`, `$postLink()`, `$onChanges()` (not Angular 2+ hooks).

**Bindings** — one-way `<?`, string `@?`, expression `&?` (AngularJS binding syntax).

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

Typical test pattern:

```typescript
import { NgbModule } from "@ngb/ngb.module"

beforeEach(() => {
    angular.mock.module(NgbModule.name)
    angular.mock.inject((_$compile_: ICompileService, _$rootScope_: IRootScopeService) => {
        $compile = _$compile_
        $rootScope = _$rootScope_
    })
})
```

### Path aliases

Defined in `tsconfig.json`:
- `@ngb/*` → `src/*`
- `@demo/*` → `demo/*`
