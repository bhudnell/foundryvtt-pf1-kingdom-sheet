import {
  alignments,
  armyHD,
  armySizes,
  armyStrategy,
  CFG,
  kingdomResourceId,
  kingdomSpecialId,
  kingdomTacticId,
} from "../../config.mjs";

export class ArmySheet extends ActorSheet {
  constructor(...args) {
    super(...args);

    this._expandedItems = new Set();
  }
  static get defaultOptions() {
    const options = super.defaultOptions;
    return {
      ...options,
      template: `modules/${CFG.id}/templates/actors/army/army-sheet.hbs`,
      classes: [...options.classes, "pf1", "actor", "kingdom"],
      tabs: [
        {
          navSelector: "nav.tabs[data-group='primary']",
          contentSelector: "section.primary-body",
          initial: "summary",
          group: "primary",
        },
      ],
    };
  }

  async getData() {
    const actor = this.actor;
    const actorData = actor.system;

    const data = {
      ...this.actor,
      enrichedNotes: await TextEditor.enrichHTML(actorData.notes),
      editable: this.isEditable,
    };

    // features (tactics, resources, special)
    data.featureSections = this._prepareFeatures();

    // selectors
    data.alignmentChoices = Object.fromEntries(
      Object.entries(alignments).map(([key, label]) => [key, game.i18n.localize(label)])
    );
    data.hdChoices = Object.fromEntries(Object.keys(armyHD).map((key) => [key, key]));
    data.sizeChoices = Object.entries(armySizes)
      .map(([key, label]) => ({ key, label: game.i18n.localize(label) }))
      .sort((a, b) => Number(a.key) - Number(b.key));
    data.strategyChoices = Object.entries(armyStrategy)
      .map(([key, label]) => ({ key, label: game.i18n.localize(label) }))
      .sort((a, b) => Number(a.key) - Number(b.key));

    // commander
    data.commanderChoices = game.actors
      .filter((actor) => actor.permission > 0 && (actor.type === "character" || actor.type === "npc"))
      .reduce((acc, actor) => {
        acc[actor.id] = actor.name;
        return acc;
      }, {});
    data.actorId = actorData.commander.actor?.id;

    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find(".item-delete").on("click", (e) => this._onItemDelete(e));
    html.find(".item-edit").on("click", (e) => this._onItemEdit(e));
    html.find(".item-create").on("click", (e) => this._onItemCreate(e));
  }

  _prepareFeatures() {
    const tactics = {
      label: game.i18n.localize("PF1KS.Army.Tactics"),
      featureType: kingdomTacticId,
      features: this.actor.itemTypes[kingdomTacticId],
    };
    const resources = {
      label: game.i18n.localize("PF1KS.Army.Resources"),
      featureType: kingdomResourceId,
      features: this.actor.itemTypes[kingdomResourceId],
    };
    const special = {
      label: game.i18n.localize("PF1KS.Army.Special"),
      featureType: kingdomSpecialId,
      features: this.actor.itemTypes[kingdomSpecialId],
    };

    return [tactics, resources, special];
  }

  async _onItemDelete(event) {
    event.preventDefault();

    const itemId = event.currentTarget.closest(".item").dataset.id;
    const item = this.actor.items.get(itemId);

    await this._onDelete({
      button: event.currentTarget,
      title: game.i18n.format("PF1.DeleteItemTitle", { name: item.name }),
      content: `<p>${game.i18n.localize("PF1.DeleteItemConfirmation")}</p>`,
      onDelete: () => item.delete(),
    });
  }

  async _onItemEdit(event) {
    event.preventDefault();
    const itemId = event.currentTarget.closest(".item").dataset.id;
    const item = this.document.items.get(itemId);

    item.sheet.render(true, { focus: true });
  }

  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;

    const type = header.dataset.type;
    const typeName = game.i18n.localize(CONFIG.Item.typeLabels[type] || type);

    const itemData = {
      name: game.i18n.format("PF1.NewItem", { type: typeName }),
      type,
      system: {},
    };

    const newItem = new Item(itemData);

    return this.actor.createEmbeddedDocuments("Item", [newItem.toObject()], { renderSheet: true });
  }

  async _onDelete({ button, title, content, onDelete }) {
    if (button.disabled) {
      return;
    }
    button.disabled = true;

    try {
      await Dialog.confirm({
        title,
        content,
        yes: () => {
          onDelete();
          button.disabled = false;
        },
        no: () => (button.disabled = false),
        rejectClose: true,
      });
    } catch (e) {
      button.disabled = false;
    }
  }

  async _activateExtendedTooltip(event) {
    const el = event.currentTarget;
    const [id, subId] = el.dataset.tooltipExtended.split(".");
    if (!id) {
      return;
    }

    const templateData = this._generateTooltipData(id, subId);

    if (!templateData.length) {
      return;
    }

    const text = await renderTemplate(`modules/${CFG.id}/templates/actors/tooltip-content.hbs`, templateData);

    game.tooltip.activate(el, {
      text,
      cssClass: "kingdom",
    });
  }

  _generateTooltipData(id, subId) {
    const data = [];
    const actorData = this.actor.system;
    switch (id) {
      // TODO
      default:
    }
    return data;
  }
}
