import { eventSubTypes, itemSubTypes } from "../../config/config.mjs";

import { ItemBaseSheet } from "./itemBaseSheet.mjs";

export class EventSheet extends ItemBaseSheet {
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
    context.subTypeChoices = Object.entries(eventSubTypes).reduce((acc, [key, label]) => {
      acc[key] = game.i18n.localize(label);
      return acc;
    }, {});

    // sidebar info
    context.sidebarContent = [
      {
        isBoolean: true,
        name: "system.continuous",
        label: game.i18n.localize("PF1KS.Continuous"),
        value: itemData.continuous,
      },
    ];

    return context;
  }
}
