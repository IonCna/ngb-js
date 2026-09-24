import { NgbConfig } from "@ngb/config/ngb-config";
import { Injectable } from "ngjs-core";

@Injectable()
export class NgbConfigAnimation extends NgbConfig {
  override animation = true;
}
