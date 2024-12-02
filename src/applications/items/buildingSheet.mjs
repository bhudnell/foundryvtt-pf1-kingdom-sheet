import { ItemBaseSheet } from "./itemBaseSheet.mjs";

export class BuildingSheet extends ItemBaseSheet {
  async getData(options = {}) {
    const context = await super.getData(options);

    // settlementId
    const settlementIdOptions = { "": "" };
    this.item.parent?.system.settlements.forEach(
      (settlement) => (settlementIdOptions[settlement.id] = settlement.name)
    );
    context.settlementIdOptions = settlementIdOptions;

    return context;
  }
}
