import { ItemBaseSheet } from "./itemBaseSheet.mjs";

// TODO whole class deprecated for v5, remove eventually
export class ImprovementSheet extends ItemBaseSheet {
  async getData(options = {}) {
    const itemData = this.item.system;
    const context = await super.getData(options);

    // subType
    context.subTypeOptions = pf1ks.config.improvementSubTypes;

    // sidebar info
    context.subType = pf1ks.config.itemSubTypes[itemData.subType];
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
