import { ItemBaseSheet } from "./itemBaseSheet.mjs";

export class BuildingSheet extends ItemBaseSheet {
  async getData(options = {}) {
    const context = await super.getData(options);

    // settlementId
    const settlementIdChoices = { "": "" };
    this.item.parent?.system.settlements?.forEach(
      (settlement) => (settlementIdChoices[settlement.id] = settlement.name)
    );
    context.settlementIdChoices = settlementIdChoices;

    return context;
  }
}
