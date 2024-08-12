import { armySelectorOptions } from "../../config.mjs";

import { ItemBaseSheet } from "./itemBaseSheet.mjs";

export class ArmySheet extends ItemBaseSheet {
  static get defaultOptions() {
    const options = super.defaultOptions;
    return {
      ...options,
      classes: [...options.classes, "army"],
    };
  }

  async getData() {
    const data = await super.getData();

    data.isArmy = true;
    data.type = game.i18n.localize("PF1KS.ArmyLabel");

    return data;
  }
}
