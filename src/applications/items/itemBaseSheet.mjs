export class ItemBaseSheet extends pf1.applications.item.ItemSheetPF {
  static get defaultOptions() {
    const options = super.defaultOptions;
    return {
      ...options,
      classes: [...options.classes, "pf1", "item", "kingdom"],
    };
  }

  get template() {
    return `modules/${pf1ks.config.CFG.id}/templates/items/item-sheet.hbs`;
  }

  async getData(options = {}) {
    const context = await super.getData(options);

    const item = this.item;
    context.isBuilding = item.type === pf1ks.config.kingdomBuildingId;
    context.isEvent = item.type === pf1ks.config.kingdomEventId;
    context.isImprovement = item.type === pf1ks.config.kingdomImprovementId;
    context.isBoon = item.type === pf1ks.config.kingdomBoonId;
    context.isSpecial = item.type === pf1ks.config.kingdomSpecialId;
    context.isTactic = item.type === pf1ks.config.kingdomTacticId;

    return context;
  }

  async _updateObject(event, formData) {
    return ItemSheet.prototype._updateObject.call(this, event, formData);
  }
}
