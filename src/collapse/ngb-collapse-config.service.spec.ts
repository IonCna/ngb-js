import { TestBed } from "ngjs-core/testing";
import { NgbCollapseConfig } from "./ngb-collapse-config.service";

describe("ngb-collapse-config", () => {
  it("should have sensible default values", () => {
    const config = TestBed.inject(NgbCollapseConfig);

    expect(config.horizontal).toBe(false);
  });
});
