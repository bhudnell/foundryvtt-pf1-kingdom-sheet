import { CFG, allChangeTargets, improvementSubTypes } from "../config.mjs";
import { getChangeCategories } from "../utils.mjs";

export class ImprovementSheet extends ItemSheet {
  static get defaultOptions() {
    const options = super.defaultOptions;
    return {
      ...options,
      template: `modules/${CFG.id}/templates/items/item-sheet.hbs`,
      classes: [...options.classes, "kingdom", "item", "improvement"],
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
      isImprovement: true,
      type: game.i18n.localize("PF1KS.ImprovementLabel"),
      enrichedDesc: await TextEditor.enrichHTML(item.system.description),
    };

    data.subTypeChoices = Object.entries(improvementSubTypes).reduce((acc, [key, label]) => {
      acc[key] = game.i18n.localize(label);
      return acc;
    }, {});

    data.changes = item.system.changes.map((c) => ({
      ...c,
      id: c.id,
      targetLabel: game.i18n.localize(allChangeTargets[c.target]),
    }));

    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find(".add-change").on("click", (e) => this._onAddChange(e));
    html.find(".delete-change").on("click", (e) => this._onDeleteChange(e));
    html.find(".target-change").on("click", (e) => this._onTargetChange(e));
  }

  async _onAddChange(event) {
    event.preventDefault();

    const changes = foundry.utils.duplicate(this.item.system.changes ?? []);
    changes.push({});
    await this._onSubmit(event, {
      updateData: { "system.changes": changes },
    });
  }

  async _onDeleteChange(event) {
    event.preventDefault();

    const changeId = event.currentTarget.closest(".item").dataset.id;

    const changes = foundry.utils.duplicate(this.item.system.changes ?? []);
    changes.findSplice((c) => c.id === changeId);

    return this._onSubmit(event, {
      updateData: { "system.changes": changes },
    });
  }

  _onTargetChange(event) {
    event.preventDefault();

    const changeId = event.currentTarget.closest(".item").dataset.id;
    const change = this.item.system.changes.find((c) => c.id === changeId);

    const item = change.target;
    const categories = getChangeCategories();
    const category = categories.find((c) => c.items.some((i) => i.key === item))?.key;

    // Show widget
    const app = new pf1.applications.Widget_CategorizedItemPicker(
      { title: "PF1.Application.ChangeTargetSelector.Title", classes: ["change-target-selector"] },
      categories,
      (key) => {
        if (key) {
          const changes = foundry.utils.duplicate(this.item.system.changes ?? []);
          const idx = changes.findIndex((change) => change.id === changeId);
          if (idx >= 0) {
            changes[idx] = foundry.utils.mergeObject(changes[idx], { target: key });
            return this.item.update({ "system.changes": changes });
          }
        }
      },
      { category, item }
    );
    app.render(true);
  }
}
