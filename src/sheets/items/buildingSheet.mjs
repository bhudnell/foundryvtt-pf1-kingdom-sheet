import { ItemBaseSheet } from "./itemBaseSheet.mjs";

export class BuildingSheet extends ItemBaseSheet {
  static get defaultOptions() {
    const options = super.defaultOptions;
    return {
      ...options,
      classes: [...options.classes, "building"],
    };
  }

  async getData() {
    const data = await super.getData();

    data.isBuilding = true;
    data.type = game.i18n.localize("PF1KS.BuildingLabel");

    return data;
  }
}
