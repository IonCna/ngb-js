import type { IInjectorService } from "angular";
import angular from "angular";
import { Injector } from "ngjs-core";
import { TestBed } from "ngjs-core/testing";
import { beforeEach, describe, expect, it } from "vitest";
import { NgbAccordionConfig } from "./accordion/ngb-accordion-config.service";
import { NgbAlertConfig } from "./alert/ngb-alert-config.service";
import { NgbCarouselConfig } from "./carousel/ngb-carousel-config.service";
import { NgbCollapseConfig } from "./collapse/ngb-collapse-config.service";
import { NgbConfig } from "./config/ngb-config";
import { NgbDatepickerConfig } from "./datepicker/ngb-datepicker-config.service";
import { NgbInputDatepickerConfig } from "./datepicker/ngb-input-datepicker-config.service";
import { NgbDropdownConfig } from "./dropdown/ngb-dropdown-config.service";
import { NgbModalConfig } from "./modal/ngb-modal-config.service";
import { NgbNavConfig } from "./nav/ngb-nav-config.service";
import { NgbModule } from "./ngb.module";
import { NgbOffcanvasConfig } from "./offcanvas/ngb-offcanvas-config.service";
import { NgbPopoverConfig } from "./popover/ngb-popover-config.service";
import { NgbProgressbarConfig } from "./progressbar/ngb-progressbar-config.service";
import { NgbRatingConfig } from "./rating/ngb-rating-config.service";
import { NgbScrollSpyConfig } from "./scrollspy/ngb-scrollspy-config.service";
import { defaultProcessChanges } from "./scrollspy/scrollspy.utils";
import { NgbToastConfig } from "./toast/ngb-toast-config.service";
import { NgbTooltipConfig } from "./tooltip/ngb-tooltip-config.service";
import { NgbTypeaheadConfig } from "./typeahead/ngb-typeahead-config.service";

describe("configuration service defaults", () => {
  let injector: Injector;
  let angularInjector: IInjectorService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [NgbModule] });
    angularInjector = TestBed.inject<IInjectorService>("$injector");
    injector = TestBed.inject(Injector);
  });

  // `environment.test.ts` (fileReplacements de `ngjs test`) apaga las animaciones, como en ng-bootstrap.
  it("provides the global animation default", () => {
    expect(injector.get(NgbConfig).animation).toBe(false);
  });

  it("provides accordion defaults", () => {
    expect(injector.get(NgbAccordionConfig)).toMatchObject({
      closeOthers: false,
      destroyOnHide: true,
      animation: false,
    });
  });

  it("provides alert defaults", () => {
    expect(injector.get(NgbAlertConfig)).toMatchObject({ animation: false, dismissible: true, type: "warning" });
  });

  it("provides carousel defaults", () => {
    expect(injector.get(NgbCarouselConfig)).toMatchObject({
      animation: false,
      interval: 5000,
      keyboard: true,
      pauseOnFocus: true,
      pauseOnHover: true,
      showNavigationArrows: true,
      showNavigationIndicators: true,
      wrap: true,
    });
  });

  it("provides collapse defaults", () => {
    expect(injector.get(NgbCollapseConfig)).toMatchObject({ animation: false, horizontal: false });
  });

  it("provides datepicker and input datepicker defaults", () => {
    expect(new NgbDatepickerConfig()).toMatchObject({
      displayMonths: 1,
      firstDayOfWeek: 1,
      navigation: "select",
      outsideDays: "visible",
      showWeekNumbers: false,
      weekdays: "narrow",
    });
    expect(new NgbInputDatepickerConfig()).toMatchObject({
      autoClose: true,
      container: null,
      placement: ["bottom-start", "bottom-end", "top-start", "top-end"],
      restoreFocus: true,
    });
  });

  it("provides dropdown defaults", () => {
    expect(injector.get(NgbDropdownConfig)).toMatchObject({
      autoClose: true,
      container: null,
      placement: ["bottom-start", "bottom-end", "top-start", "top-end"],
    });
  });

  it("provides modal and offcanvas defaults", () => {
    // `@Service` → se pide por el `Injector` de ngjs-core (como el resto de los configs).
    expect(injector.get(NgbModalConfig)).toMatchObject({
      animation: false,
      backdrop: true,
      fullscreen: false,
      keyboard: true,
    });
    expect(injector.get(NgbOffcanvasConfig)).toMatchObject({
      animation: false,
      backdrop: true,
      keyboard: true,
      position: "start",
      scroll: false,
    });
  });

  it("provides nav defaults", () => {
    expect(injector.get(NgbNavConfig)).toMatchObject({
      animation: false,
      destroyOnHide: true,
      keyboard: true,
      orientation: "horizontal",
      roles: "tablist",
    });
  });

  it("provides popover and tooltip defaults", () => {
    expect(injector.get(NgbPopoverConfig)).toMatchObject({
      animation: false,
      autoClose: true,
      closeDelay: 0,
      disablePopover: false,
      openDelay: 0,
      placement: "auto",
      triggers: "click",
    });
    expect(injector.get(NgbTooltipConfig)).toMatchObject({
      animation: false,
      autoClose: true,
      closeDelay: 0,
      disableTooltip: false,
      openDelay: 0,
      placement: "auto",
      triggers: "hover focus",
    });
  });

  it("provides progressbar and rating defaults", () => {
    expect(injector.get(NgbProgressbarConfig)).toMatchObject({
      animated: false,
      ariaLabel: "progress bar",
      max: 100,
      showValue: false,
      striped: false,
    });
    expect(injector.get(NgbRatingConfig)).toMatchObject({ max: 10, readonly: false, resettable: false, tabindex: 0 });
  });

  it("provides scrollspy defaults", () => {
    expect(injector.get(NgbScrollSpyConfig)).toMatchObject({
      processChanges: defaultProcessChanges,
      scrollBehavior: "smooth",
    });
  });

  it("provides toast defaults", () => {
    expect(injector.get(NgbToastConfig)).toMatchObject({
      animation: false,
      ariaLive: "polite",
      autohide: true,
      delay: 5000,
    });
  });

  it("provides typeahead defaults", () => {
    expect(injector.get(NgbTypeaheadConfig)).toMatchObject({
      editable: true,
      focusFirst: true,
      placement: ["bottom-start", "bottom-end", "top-start", "top-end"],
      selectOnExact: false,
      showHint: false,
    });
  });

  it("lets local animation overrides take precedence over NgbConfig", () => {
    const globalConfig = injector.get(NgbConfig);
    const configs = [
      injector.get(NgbAccordionConfig),
      injector.get(NgbAlertConfig),
      injector.get(NgbCarouselConfig),
      injector.get(NgbCollapseConfig),
      injector.get(NgbNavConfig),
      injector.get(NgbToastConfig),
      injector.get(NgbTooltipConfig),
    ];

    globalConfig.animation = false;
    for (const config of configs) expect(config.animation).toBe(false);
    for (const config of configs) config.animation = true;
    globalConfig.animation = false;
    for (const config of configs) expect(config.animation).toBe(true);
  });
});
