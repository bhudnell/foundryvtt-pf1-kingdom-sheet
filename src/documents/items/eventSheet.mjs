import { eventSubTypes } from "../../config.mjs";

import { ItemBaseSheet } from "./itemBaseSheet.mjs";

export class EventSheet extends ItemBaseSheet {
  static get defaultOptions() {
    const options = super.defaultOptions;
    return {
      ...options,
      classes: [...options.classes, "event"],
    };
  }

  async getData() {
    const data = await super.getData();

    data.isEvent = true;
    data.type = game.i18n.localize("PF1KS.EventLabel");

    // subType
    data.subTypeChoices = Object.entries(eventSubTypes).reduce((acc, [key, label]) => {
      acc[key] = game.i18n.localize(label);
      return acc;
    }, {});

    return data;
  }
}
