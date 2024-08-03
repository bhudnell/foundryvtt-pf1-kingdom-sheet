import { improvementSubTypes } from "../../config.mjs";

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
    const data = await super.getData();

    data.isImprovement = true;
    data.type = game.i18n.localize("PF1KS.ImprovementLabel");

    // subType
    data.subTypeChoices = Object.entries(improvementSubTypes).reduce((acc, [key, label]) => {
      acc[key] = game.i18n.localize(label);
      return acc;
    }, {});

    // settlementId
    const settlementIdChoices = { "": "" };
    this.item.parent?.system.settlements.forEach(
      (settlement) => (settlementIdChoices[settlement.id] = settlement.name)
    );
    data.settlementIdChoices = settlementIdChoices;

    return data;
  }
}
