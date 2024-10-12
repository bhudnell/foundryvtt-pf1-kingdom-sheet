import { ItemBaseSheet } from "./itemBaseSheet.mjs";

export class TacticSheet extends ItemBaseSheet {
  async getData(options = {}) {
    const context = await super.getData(options);

    const itemData = this.item.system;
    context.states = [
      {
        field: "system.disabled",
        value: itemData.disabled,
        label: game.i18n.localize("PF1KS.Disabled"),
      },
    ];

    return context;
  }
}
