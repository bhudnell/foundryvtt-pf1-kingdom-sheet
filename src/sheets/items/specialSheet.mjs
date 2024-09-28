import { ItemBaseSheet } from "./itemBaseSheet.mjs";

export class SpecialSheet extends ItemBaseSheet {
  static get defaultOptions() {
    const options = super.defaultOptions;
    return {
      ...options,
      classes: [...options.classes, "special"],
    };
  }

  async getData() {
    const data = await super.getData();

    data.isSpecial = true;
    data.type = game.i18n.localize("PF1KS.Sheet.Special");

    return data;
  }
}
