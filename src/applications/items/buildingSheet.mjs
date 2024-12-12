import { ItemBaseSheet } from "./itemBaseSheet.mjs";

export class BuildingSheet extends ItemBaseSheet {
  async getData(options = {}) {
    const itemData = this.item.system;
    const context = await super.getData(options);

    // settlementId
    const settlementIdOptions = { "": "" };
    this.item.parent?.system.settlements.forEach(
      (settlement) => (settlementIdOptions[settlement.id] = settlement.name)
    );
    context.settlementIdOptions = settlementIdOptions;

    // buildingType
    context.buildingTypeOptions = pf1ks.config.buildingTypes;

    // sidebar info
    context.subType = pf1ks.config.buildingTypes[itemData.type];
    context.sidebarContent = [
      {
        isNumber: true,
        name: "system.quantity",
        label: game.i18n.localize("PF1.Quantity"),
        value: itemData.quantity,
      },
    ];

    return context;
  }
}
