import {
  CFG,
  kingdomBoonId,
  kingdomBuildingId,
  kingdomEventId,
  kingdomImprovementId,
  kingdomSpecialId,
  kingdomTacticId,
} from "../../config/config.mjs";

export class ItemBaseSheet extends pf1.applications.item.ItemSheetPF {
  static get defaultOptions() {
    const options = super.defaultOptions;
    return {
      ...options,
      classes: [...options.classes, "pf1", "item", "kingdom"],
    };
  }

  get template() {
    return `modules/${CFG.id}/templates/items/item-sheet.hbs`;
  }

  async getData(options = {}) {
    const context = await super.getData(options);

    const item = this.item;
    context.isBuilding = item.type === kingdomBuildingId;
    context.isEvent = item.type === kingdomEventId;
    context.isImprovement = item.type === kingdomImprovementId;
    context.isBoon = item.type === kingdomBoonId;
    context.isSpecial = item.type === kingdomSpecialId;
    context.isTactic = item.type === kingdomTacticId;

    return context;
  }
}
