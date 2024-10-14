import { improvementSubTypes, itemSubTypes } from "../../config/config.mjs";

import { ItemBaseSheet } from "./itemBaseSheet.mjs";

export class ImprovementSheet extends ItemBaseSheet {
  async getData(options = {}) {
    const itemData = this.item.system;
    const context = await super.getData(options);

    // settlementId
    const settlementIdChoices = { "": "" };
    this.item.parent?.system.settlements.forEach(
      (settlement) => (settlementIdChoices[settlement.id] = settlement.name)
    );
    context.settlementIdChoices = settlementIdChoices;

    // subType
    context.subType = game.i18n.localize(itemSubTypes[itemData.subType]);
    context.subTypeChoices = Object.entries(improvementSubTypes).reduce((acc, [key, label]) => {
      acc[key] = game.i18n.localize(label);
      return acc;
    }, {});

    // sidebar info
    context.sidebarContent = [
      {
        isNumber: true,
        name: "system.quantity",
        label: game.i18n.localize("PF1KS.Quantity"),
        value: itemData.quantity,
      },
    ];

    return context;
  }
}
