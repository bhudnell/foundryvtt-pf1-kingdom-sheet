import { CFG } from "../config.mjs";

export class BuildingSheet extends ItemSheet {
  static get defaultOptions() {
    const options = super.defaultOptions;
    return {
      ...options,
      template: `modules/${CFG.id}/templates/items/item-sheet.hbs`,
      classes: [...options.classes, "kingdom", "item", "building"],
      tabs: [
        {
          navSelector: "nav.tabs[data-group='primary']",
          contentSelector: "section.primary-body",
          initial: "description",
          group: "primary",
        },
      ],
    };
  }

  async getData() {
    const item = this.item;

    const data = {
      ...item,
      isBuilding: true,
      type: game.i18n.localize("PF1KS.Building"),
      enrichedDesc: await TextEditor.enrichHTML(item.system.description),
    };

    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);
  }
}
