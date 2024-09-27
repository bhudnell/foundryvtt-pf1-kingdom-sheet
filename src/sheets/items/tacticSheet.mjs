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
    const data = await super.getData();

    data.isTactic = true;
    data.type = game.i18n.localize("PF1KS.Tactic");

    return data;
  }
}
