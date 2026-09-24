import { TestBed } from "ngjs-core/testing";
import { NgbAlertConfig } from "./ngb-alert-config.service";

describe("ngb-alert-config", () => {
  it("should have sensible default values", () => {
    const config = TestBed.inject(NgbAlertConfig);

    expect(config.dismissible).toBe(true);
    expect(config.type).toBe("warning");
  });
});
