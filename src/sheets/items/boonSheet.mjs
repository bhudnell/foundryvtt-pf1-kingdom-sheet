import { ItemBaseSheet } from "./itemBaseSheet.mjs";

export class BoonSheet extends ItemBaseSheet {
  static get defaultOptions() {
    const options = super.defaultOptions;
    return {
      ...options,
      classes: [...options.classes, "boon"],
    };
  }

  async getData() {
    const data = await super.getData();

    data.isBoon = true;
    data.type = game.i18n.localize("PF1KS.Boon");

    return data;
  }
}
