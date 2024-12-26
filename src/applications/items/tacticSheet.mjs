import { ItemBaseSheet } from "./itemBaseSheet.mjs";

export class TacticSheet extends ItemBaseSheet {
  async getData(options = {}) {
    const itemData = this.item.system;
    const context = await super.getData(options);

    // sidebar info
    context.states = [
      {
        field: "system.disabled",
        value: itemData.disabled,
        label: game.i18n.localize("PF1.Disabled"),
      },
    ];

    return context;
  }
}
