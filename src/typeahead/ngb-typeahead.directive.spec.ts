import { NgbTypeahead } from "@ngb/typeahead/ngb-typeahead.directive";
import angular, {
  type IAugmentedJQuery,
  type ICompileService,
  type INgModelController,
  type IRootScopeService,
  type IScope,
} from "angular";
import { map, type Observable, of, Subject, switchMap } from "rxjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { configureTestBed, type NgbTestBed } from "../../test/testbed";
import { NgbModule } from "../ngb.module";

interface TestScope extends IScope {
  model: unknown;
  search: (text$: Observable<string>) => Observable<readonly unknown[]>;
  inputFormatter?: (item: unknown) => string;
  resultFormatter?: (item: unknown) => string;
  selected?: ReturnType<typeof vi.fn>;
}

interface TypeaheadInternals extends NgbTypeahead {
  _windowRef?: {
    location: { nativeElement: HTMLElement };
    instance: { getActive(): unknown; hasActive(): boolean };
  } | null;
}

describe("NgbTypeahead", () => {
  let tb: NgbTestBed;
  let $compile: ICompileService;
  let $rootScope: IRootScopeService;
  const mounted: IAugmentedJQuery[] = [];

  beforeEach(async () => {
    tb = await configureTestBed(NgbModule);
    $compile = tb.$compile;
    $rootScope = tb.$rootScope;
  });

  afterEach(() => {
    mounted.forEach((element) => {
      element.remove();
    });
    mounted.length = 0;
    tb.destroy();
  });

  function setup(template = '<input ng-model="model" ngb-typeahead="search">', values: Partial<TestScope> = {}) {
    const scope = $rootScope.$new() as TestScope;
    Object.assign(scope, { model: null, search: (text$: Observable<string>) => text$.pipe(map(() => ["Alaska", "Alabama"])) }, values);
    const element = $compile(template)(scope);
    angular.element(document.body).append(element);
    mounted.push(element);
    scope.$digest();
    const input = element[0] as HTMLInputElement;
    const controller = element.controller("ngbTypeahead") as unknown as TypeaheadInternals;
    const modelController = element.controller("ngModel") as INgModelController;
    return { scope, input, controller, modelController };
  }

  async function enter(input: HTMLInputElement, scope: IScope, value: string) {
    input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    scope.$digest();
    await vi.waitFor(() => {
      scope.$digest();
      expect(input.classList.contains("open")).toBe(true);
    });
  }

  function keydown(input: HTMLInputElement, key: string) {
    const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
    input.dispatchEvent(event);
    return event;
  }

  it("renders results from the first emission", async () => {
    const { scope, input, controller } = setup();
    await enter(input, scope, "ala");
    expect(
      Array.from(controller._windowRef?.location.nativeElement.querySelectorAll("button") ?? [], ({ textContent }) =>
        textContent?.trim(),
      ),
    ).toEqual(["Alaska", "Alabama"]);
  });

  it("adds the combobox attributes used by ng-bootstrap", () => {
    const { input } = setup();
    expect(input.getAttribute("role")).toBe("combobox");
    expect(input.getAttribute("autocomplete")).toBe("off");
    expect(input.getAttribute("autocapitalize")).toBe("off");
    expect(input.getAttribute("autocorrect")).toBe("off");
    expect(input.getAttribute("aria-autocomplete")).toBe("list");
    expect(input.getAttribute("aria-expanded")).toBe("false");
    expect(input.hasAttribute("aria-controls")).toBe(false);
  });

  it("formats model values with the default and custom input formatters", () => {
    const first = setup(undefined, { model: 0 });
    expect(first.input.value).toBe("0");
    const second = setup('<input ng-model="model" ngb-typeahead="search" input-formatter="inputFormatter">', {
      model: { name: "Alaska" },
      inputFormatter: (item) => `State: ${(item as { name: string }).name}`,
    });
    expect(second.input.value).toBe("State: Alaska");
  });

  it("propagates typed text when editable and null when not editable", () => {
    const editable = setup();
    editable.input.value = "ala";
    editable.input.dispatchEvent(new Event("input", { bubbles: true }));
    editable.scope.$digest();
    expect(editable.scope.model).toBe("ala");
    const restricted = setup('<input ng-model="model" ngb-typeahead="search" editable="false">');
    restricted.input.value = "ala";
    restricted.input.dispatchEvent(new Event("input", { bubbles: true }));
    restricted.scope.$digest();
    expect(restricted.scope.model).toBeNull();
  });

  it("opens and closes with the matching ARIA state", async () => {
    const { scope, input, controller } = setup();
    await enter(input, scope, "ala");
    expect(input.getAttribute("aria-expanded")).toBe("true");
    expect(input.getAttribute("aria-controls")).toBe(controller.popupId);
    controller.dismissPopup();
    scope.$digest();
    expect(controller.isPopupOpen()).toBe(false);
    expect(input.getAttribute("aria-expanded")).toBe("false");
    expect(input.hasAttribute("aria-controls")).toBe(false);
  });

  it("closes the popup when the source emits no results", async () => {
    const results = new Subject<readonly string[]>();
    const { scope, input, controller } = setup(undefined, { search: (text$: Observable<string>) => text$.pipe(switchMap(() => results)) });
    input.value = "a";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    results.next(["Alaska"]);
    await vi.waitFor(() => expect(controller.isPopupOpen()).toBe(true));
    results.next([]);
    scope.$digest();
    expect(controller.isPopupOpen()).toBe(false);
  });

  it("moves the active result with arrows and exposes aria-activedescendant", async () => {
    const { scope, input, controller } = setup();
    await enter(input, scope, "ala");
    expect(input.getAttribute("aria-activedescendant")).toBe(`${controller.popupId}-0`);
    const down = keydown(input, "ArrowDown");
    scope.$digest();
    expect(down.defaultPrevented).toBe(true);
    expect(input.getAttribute("aria-activedescendant")).toBe(`${controller.popupId}-1`);
    keydown(input, "ArrowUp");
    scope.$digest();
    expect(input.getAttribute("aria-activedescendant")).toBe(`${controller.popupId}-0`);
  });

  it.each(["Enter", "Tab"])("selects the active result with %s", async (key) => {
    const selected = vi.fn();
    const { scope, input, controller } = setup(
      '<input ng-model="model" ngb-typeahead="search" select-item="selected($event)">',
      { selected },
    );
    await enter(input, scope, "ala");
    const event = keydown(input, key);
    scope.$digest();
    expect(event.defaultPrevented).toBe(true);
    expect(selected).toHaveBeenCalledWith(expect.objectContaining({ item: "Alaska" }));
    expect(scope.model).toBe("Alaska");
    expect(controller.isPopupOpen()).toBe(false);
  });

  it("allows selectItem to prevent the model update", async () => {
    const selected = vi.fn((event: { preventDefault(): void }) => event.preventDefault());
    const { scope, input } = setup('<input ng-model="model" ngb-typeahead="search" select-item="selected($event)">', {
      selected,
    });
    await enter(input, scope, "ala");
    keydown(input, "Enter");
    scope.$digest();
    expect(selected).toHaveBeenCalledOnce();
    expect(scope.model).toBe("ala");
  });

  it("does not select on Enter when focusFirst is false and no row is active", async () => {
    const { scope, input, controller } = setup('<input ng-model="model" ngb-typeahead="search" focus-first="false">');
    await enter(input, scope, "ala");
    const event = keydown(input, "Enter");
    scope.$digest();
    expect(event.defaultPrevented).toBe(false);
    expect(scope.model).toBe("ala");
    expect(controller.isPopupOpen()).toBe(false);
  });

  it("selects a sole exact result without opening the popup", async () => {
    const { scope, input, controller } = setup(
      '<input ng-model="model" ngb-typeahead="search" select-on-exact="true">',
      { search: (text$: Observable<string>) => text$.pipe(map(() => ["Alaska"])) },
    );
    input.value = "Alaska";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    scope.$digest();
    await vi.waitFor(() => expect(scope.model).toBe("Alaska"));
    expect(controller.isPopupOpen()).toBe(false);
  });

  it("does not select a sole result when its formatted value is not exact", async () => {
    const { scope, input, controller } = setup(
      '<input ng-model="model" ngb-typeahead="search" select-on-exact="true">',
      { search: (text$: Observable<string>) => text$.pipe(map(() => ["Alaska"])) },
    );
    await enter(input, scope, "ala");
    expect(scope.model).toBe("ala");
    expect(controller.isPopupOpen()).toBe(true);
  });

  it("uses the result formatter only inside the popup", async () => {
    const { scope, input, controller } = setup(
      '<input ng-model="model" ngb-typeahead="search" result-formatter="resultFormatter">',
      { resultFormatter: (item) => String(item).toUpperCase() },
    );
    await enter(input, scope, "ala");
    expect(controller._windowRef?.location.nativeElement.querySelector("button")?.textContent?.trim()).toBe("ALASKA");
    expect(input.value).toBe("ala");
  });

  it("renders the popup in body and applies popupClass", async () => {
    const { scope, input, controller } = setup(
      '<input ng-model="model" ngb-typeahead="search" container="\'body\'" popup-class="\'custom-popup\'">',
    );
    await enter(input, scope, "ala");
    const popup = controller._windowRef?.location.nativeElement;
    expect(popup).toBeDefined();
    if (!popup) return;
    expect(popup.parentElement).toBe(document.body);
    expect(popup.classList.contains("custom-popup")).toBe(true);
    expect(popup.style.zIndex).toBe("1055");
  });

  it("supports hint completion and restores the typed value when dismissed", async () => {
    const { scope, input, controller } = setup('<input ng-model="model" ngb-typeahead="search" show-hint="true">', {
      search: (text$: Observable<string>) => text$.pipe(map(() => ["Alaska"])),
    });
    await enter(input, scope, "ala");
    expect(input.value).toBe("alaska");
    expect(input.selectionStart).toBe(3);
    expect(input.selectionEnd).toBe(6);
    expect(input.getAttribute("aria-autocomplete")).toBe("both");
    controller.dismissPopup();
    scope.$digest();
    expect(input.value).toBe("ala");
  });

  it("marks the control touched on blur and reflects disabled state", () => {
    const { input, modelController, controller } = setup();
    expect(modelController.$touched).toBe(false);
    input.dispatchEvent(new FocusEvent("blur", { bubbles: true }));
    expect(modelController.$touched).toBe(true);
    controller.setDisabledState(true);
    expect(input.disabled).toBe(true);
  });

  it("ignores navigation keys while the popup is closed", () => {
    const { input } = setup();
    expect(keydown(input, "ArrowDown").defaultPrevented).toBe(false);
    expect(keydown(input, "Enter").defaultPrevented).toBe(false);
  });

  it("selects a result clicked in the popup", async () => {
    const { scope, input, controller } = setup();
    await enter(input, scope, "ala");
    controller._windowRef?.location.nativeElement.querySelectorAll<HTMLButtonElement>("button")[1].click();
    scope.$digest();
    expect(scope.model).toBe("Alabama");
    expect(input.value).toBe("Alabama");
    expect(controller.isPopupOpen()).toBe(false);
  });

  it("selects the first result after ArrowDown when focusFirst is false", async () => {
    const { scope, input } = setup('<input ng-model="model" ngb-typeahead="search" focus-first="false">');
    await enter(input, scope, "ala");
    keydown(input, "ArrowDown");
    keydown(input, "Enter");
    scope.$digest();
    expect(scope.model).toBe("Alaska");
  });

  it("switches to the latest result stream when the user types again", async () => {
    const first = new Subject<readonly string[]>();
    const second = new Subject<readonly string[]>();
    const { input, controller } = setup(undefined, {
      search: (text$: Observable<string>) => text$.pipe(switchMap((text) => (text === "a" ? first : second))),
    });
    input.value = "a";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.value = "al";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    first.next(["stale"]);
    expect(controller.isPopupOpen()).toBe(false);
    second.next(["Alaska"]);
    await vi.waitFor(() => expect(controller.isPopupOpen()).toBe(true));
    expect(controller._windowRef?.location.nativeElement.textContent).toContain("Alaska");
    expect(controller._windowRef?.location.nativeElement.textContent).not.toContain("stale");
  });

  it("uses inputFormatter when matching an exact object result", async () => {
    const alaska = { name: "Alaska" };
    const selected = vi.fn();
    const { scope, input, controller } = setup(
      '<input ng-model="model" ngb-typeahead="search" input-formatter="inputFormatter" select-on-exact="true" select-item="selected($event)">',
      { search: (text$: Observable<string>) => text$.pipe(map(() => [alaska])), inputFormatter: (item) => (item as { name: string }).name, selected },
    );
    input.value = "Alaska";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    scope.$digest();
    await vi.waitFor(() => expect(selected).toHaveBeenCalled());
    expect(scope.model).toBe(alaska);
    expect(controller.isPopupOpen()).toBe(false);
  });

  it("honors a custom autocomplete attribute", () => {
    const { input } = setup('<input ng-model="model" ngb-typeahead="search" autocomplete="postal-code">');
    expect(input.getAttribute("autocomplete")).toBe("postal-code");
  });
});
