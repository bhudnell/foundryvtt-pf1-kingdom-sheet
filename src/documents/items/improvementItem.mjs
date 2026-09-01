import { BaseItemKS } from "./baseItem.mjs";

// TODO whole class deprecated for v5, remove eventually
export class ImprovementItem extends BaseItemKS {
  static system = Object.freeze({
    ...super.system,
    subtypeName: true,
  });

  get isActive() {
    return this.system.quantity > 0;
  }
}
