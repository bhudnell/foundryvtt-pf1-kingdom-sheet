import { BaseItemKS } from "./baseItem.mjs";

export class FeatureItem extends BaseItemKS {
  static system = Object.freeze({
    ...super.system,
    subtypeName: true,
  });

  get isActive() {
    return this.isAssigned;
  }

  get isAssigned() {
    const settlementIds = this.parent?.system.settlements.map((settlement) => settlement.id) ?? [];

    return settlementIds.includes(this.system.settlementId);
  }
}
