import { NgbModal } from "@ngb/modal/ngb-modal.service";
import { NgbModalConfig } from "@ngb/modal/ngb-modal-config.service";
import { NgbModule } from "@ngb/ngb.module";
import { Injector, NgModule } from "ngjs-core";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { configureTestBed, type NgbTestBed } from "../../test/testbed";
import { NGB_MODAL, NGB_MODAL_CONFIG } from "./tokens";

@NgModule({ id: "ngb.modal.compat.spec", imports: [NgbModule] })
class CompatSpecModule {}

describe("ngb-js/modal — tokens NGB_MODAL / NGB_MODAL_CONFIG para $inject", () => {
  let tb: NgbTestBed;

  beforeEach(async () => {
    tb = await configureTestBed(CompatSpecModule);
  });

  afterEach(() => tb?.destroy());

  it("los tokens son strings distintos del $name interno del @Service", () => {
    expect([NGB_MODAL, NGB_MODAL_CONFIG]).toEqual(["ngb.modal", "ngb.modal.config"]);
    expect(NGB_MODAL).not.toBe((NgbModal as unknown as { $name: string }).$name);
  });

  it("$injector.get(TOKEN) resuelve el servicio (uso con $inject en apps AngularJS)", () => {
    expect(tb.get(NGB_MODAL)).toBeInstanceOf(NgbModal);
    expect(tb.get<NgbModalConfig>(NGB_MODAL_CONFIG)).toMatchObject({
      backdrop: true,
      keyboard: true,
      role: "dialog",
    });
  });

  it("es la MISMA instancia singleton que inject(NgbModal) / Injector.get(clase)", () => {
    const viaInjector = tb.get<Injector>(Injector.$name);
    expect(tb.get(NGB_MODAL)).toBe(viaInjector.get(NgbModal));
    expect(tb.get(NGB_MODAL_CONFIG)).toBe(viaInjector.get(NgbModalConfig));
  });
});
