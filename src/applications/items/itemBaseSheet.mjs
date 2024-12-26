export class ItemBaseSheet extends pf1.applications.item.ItemSheetPF {
  static get defaultOptions() {
    const options = super.defaultOptions;
    return {
      ...options,
      classes: [...options.classes, "pf1", "item", "kingdom"],
    };
  }

  get template() {
    return `modules/${pf1ks.config.moduleId}/templates/items/item-sheet.hbs`;
  }

  async getData(options = {}) {
    const context = await super.getData(options);

    const item = this.item;
    context.isBuilding = item.type === pf1ks.config.buildingId;
    context.isEvent = item.type === pf1ks.config.eventId;
    context.isImprovement = item.type === pf1ks.config.improvementId;
    context.isBoon = item.type === pf1ks.config.boonId;
    context.isSpecial = item.type === pf1ks.config.specialId;
    context.isTactic = item.type === pf1ks.config.tacticId;
    context.showDetails = context.isBuilding || context.isEvent || context.isImprovement;

    return context;
  }

  async _updateObject(event, formData) {
    return ItemSheet.prototype._updateObject.call(this, event, formData);
  }
}
