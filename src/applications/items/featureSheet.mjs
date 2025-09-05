import { ItemBaseSheet } from "./itemBaseSheet.mjs";

export class FeatureSheet extends ItemBaseSheet {
  async getData(options = {}) {
    const itemData = this.item.system;
    const context = await super.getData(options);

    // settlementId
    const settlementIdOptions = { "": "" };
    this.item.parent?.system.settlements.forEach(
      (settlement) => (settlementIdOptions[settlement.id] = settlement.name)
    );
    context.settlementIdOptions = settlementIdOptions;

    // subType
    context.subTypeOptions = pf1ks.config.featureSubTypes;

    // sidebar info
    context.subType = pf1ks.config.itemSubTypes[itemData.subType];

    return context;
  }
}
