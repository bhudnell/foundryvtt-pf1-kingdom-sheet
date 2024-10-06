import { improvementSubTypes, itemSubTypes } from "../../config/config.mjs";

import { ItemBaseSheet } from "./itemBaseSheet.mjs";

export class ImprovementSheet extends ItemBaseSheet {
  static get defaultOptions() {
    const options = super.defaultOptions;
    return {
      ...options,
      classes: [...options.classes, "improvement"],
    };
  }

  async getData() {
    const itemData = this.item.system;
    const data = await super.getData();

    data.isImprovement = true;
    data.type = game.i18n.localize("PF1KS.Sheet.Improvement");
    data.subType = game.i18n.localize(itemSubTypes[itemData.subType]);

    // subType
    data.subTypeChoices = Object.entries(improvementSubTypes).reduce((acc, [key, label]) => {
      acc[key] = game.i18n.localize(label);
      return acc;
    }, {});

    // sidebar info
    data.sidebarContent = [
      {
        isNumber: true,
        name: "system.amount",
        label: game.i18n.localize("PF1KS.Quantity"),
        value: itemData.amount,
      },
    ];

    return data;
  }
}
