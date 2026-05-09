import { BaseItemKS } from "./baseItem.mjs";

export class FeatureItem extends BaseItemKS {
  static system = Object.freeze({
    ...super.system,
    subtypeName: true,
  });

  get isActive() {
    return this.isAssigned;
  }

  // TODO deprecated remove this when removing all v4 deprecated stuff
  get isAssigned() {
    if (this.parent?.type === pf1ks.config.kingdomId) {
      const settlementIds = this.parent?.system.settlements.map((settlement) => settlement.id) ?? [];

      return settlementIds.includes(this.system.settlementId);
    }
    return true;
  }
}
