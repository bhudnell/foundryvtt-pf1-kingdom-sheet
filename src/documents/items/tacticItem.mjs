import { BaseItemKS } from "./baseItem.mjs";

export class TacticItem extends BaseItemKS {
  get isActive() {
    return !this.system.disabled;
  }
}
