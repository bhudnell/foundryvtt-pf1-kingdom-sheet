import { ItemBaseSheet } from "./itemBaseSheet.mjs";

export class TacticSheet extends ItemBaseSheet {
  static get defaultOptions() {
    const options = super.defaultOptions;
    return {
      ...options,
      classes: [...options.classes, "tactic"],
    };
  }

  async getData() {
    const itemData = this.item.system;
    const data = await super.getData();

    data.isTactic = true;
    data.type = game.i18n.localize("PF1KS.Sheet.Tactic");
    data.states = [
      {
        field: "system.disabled",
        value: itemData.disabled,
        label: game.i18n.localize("PF1KS.Disabled"),
      },
    ];

    return data;
  }
}
