import { CFG, allChangeTargets, changeScopes, allSettlementModifiers } from "../../config.mjs";
import { getChangeCategories } from "../../utils.mjs";

export class ItemBaseSheet extends ItemSheet {
  static get defaultOptions() {
    const options = super.defaultOptions;
    return {
      ...options,
      template: `modules/${CFG.id}/templates/items/item-sheet.hbs`,
      classes: [...options.classes, "kingdom", "item"],
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
      enrichedDesc: await TextEditor.enrichHTML(item.system.description),
    };
    // settlementId
    const settlementIdChoices = { "": "" };
    this.item.parent?.system.settlements.forEach(
      (settlement) => (settlementIdChoices[settlement.id] = settlement.name)
    );
    data.settlementIdChoices = settlementIdChoices;

    // changes
    data.scopeChoices = Object.entries(changeScopes).reduce((acc, [key, label]) => {
      acc[key] = game.i18n.localize(label);
      return acc;
    }, {});

    data.changes = item.system.changes?.map((c) => ({
      ...c,
      id: c.id,
      targetLabel: game.i18n.localize(allChangeTargets[c.target]),
      disableScope: !Object.keys(allSettlementModifiers).includes(c.target),
    }));

    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find(".add-change").on("click", (e) => this._onAddChange(e));
    html.find(".duplicate-change").on("click", (e) => this._onDuplicateChange(e));
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

  _onDuplicateChange(event) {
    event.preventDefault();
    const changeId = event.currentTarget.closest(".item").dataset.id;
    const change = this.item.system.changes.find((c) => c.id === changeId);

    const changes = foundry.utils.duplicate(this.item.system.changes ?? []);
    if (change) {
      const newChange = foundry.utils.duplicate(change);
      delete newChange.id;

      changes.push(newChange);

      return this._onSubmit(event, {
        updateData: { "system.changes": changes },
      });
    }
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
            if (!Object.keys(allSettlementModifiers).includes(key)) {
              changes[idx] = foundry.utils.mergeObject(changes[idx], { scope: "kingdom" });
            }
            return this.item.update({ "system.changes": changes });
          }
        }
      },
      { category, item }
    );
    app.render(true);
  }
}
