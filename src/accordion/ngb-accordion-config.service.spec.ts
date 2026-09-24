import { TestBed } from "ngjs-core/testing";
import { NgbAccordionConfig } from "./ngb-accordion-config.service";

describe("ngb-accordion-config", () => {
  it("should have sensible default values", () => {
    const config = TestBed.inject(NgbAccordionConfig);

    expect(config.closeOthers).toBe(false);
    expect(config.destroyOnHide).toBe(true);
  });
});
