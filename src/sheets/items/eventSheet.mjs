import { eventSubTypes, itemSubTypes } from "../../config.mjs";

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
    const itemData = this.item.system;
    const data = await super.getData();

    data.isEvent = true;
    data.type = game.i18n.localize("PF1KS.EventLabel");
    data.subType = game.i18n.localize(itemSubTypes[itemData.subType]);

    // subType
    data.subTypeChoices = Object.entries(eventSubTypes).reduce((acc, [key, label]) => {
      acc[key] = game.i18n.localize(label);
      return acc;
    }, {});

    // sidebar info
    data.sidebarContent = [
      {
        isBoolean: true,
        name: "system.continuous",
        label: game.i18n.localize("PF1KS.Continuous"),
        value: itemData.continuous,
      },
    ];

    return data;
  }
}
