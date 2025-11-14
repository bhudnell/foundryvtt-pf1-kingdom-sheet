import { BaseItemKS } from "./baseItem.mjs";

export class ImprovementItem extends BaseItemKS {
  static system = Object.freeze({
    ...super.system,
    subtypeName: true,
  });

  get isActive() {
    return this.system.quantity > 0;
  }
}
