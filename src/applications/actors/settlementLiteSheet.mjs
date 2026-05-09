import { findLargestSmallerNumber, keepUpdateArray, renameKeys } from "../../util/utils.mjs";

export class SettlementLiteSheet extends pf1.applications.actor.ActorSheetPF {
  constructor(actor, options) {
    options.tabs = [
      {
        navSelector: "nav.tabs[data-group='primary']",
        contentSelector: "section.primary-body",
        initial: "summary",
        group: "primary",
      },
    ];

    super(actor, options);
  }

  static get defaultOptions() {
    const options = super.defaultOptions;
    return {
      ...options,
      classes: [...options.classes, "pf1ks", "settlement", "lite"],
      scrollY: [...options.scrollY, ".subdetails-body"],
      height: 730,
      width: 670,
    };
  }

  get template() {
    return `modules/${pf1ks.config.moduleId}/templates/actors/settlementLite/${this.isEditable ? "edit" : "view"}.hbs`;
  }

  async getData() {
    const actor = this.actor;
    const actorData = actor.system;
    const isOwner = actor.isOwner;

    const data = {
      ...this.actor,
      owner: isOwner,
      enrichedNotes: await TextEditor.enrichHTML(actorData.notes.value ?? "", {
        rolldata: actor.getRollData(),
        async: true,
        secrets: this.object.isOwner,
        relativeTo: this.actor,
      }),
      editable: this.isEditable,
      cssClass: isOwner ? "editable" : "locked",
    };

    // selectors
    data.alignmentOptions = pf1.config.alignments;
    data.governmentOptions = pf1ks.config.settlementGovernments;
    data.sizeOptions = pf1ks.config.settlementSizes;

    // summary
    data.sizeLabel = pf1ks.config.settlementSizes[actorData.attributes.size];
    data.modifiers = [];
    for (const [mod, label] of Object.entries(pf1ks.config.settlementModifiers)) {
      data.modifiers.push({ id: mod, label, value: actorData.modifiers[mod] });
    }

    // features
    data.sections = this._prepareItems();

    // magic items
    data.magicItems = Object.entries(pf1ks.config.magicItemTypes).map(([key, label]) => {
      const itemType = actorData.magicItems[key];

      return {
        ...itemType,
        key,
        label,
        current: itemType.current,
        error:
          itemType.current > itemType.max
            ? game.i18n.format("PF1KS.TooManyMagicItems", { max: itemType.max })
            : undefined,
      };
    });

    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find(".magic-item-delete").on("click", (e) => this._onMagicItemDelete(e));
  }

  _prepareItems() {
    const featureSections = Object.values(pf1.config.sheetSections.settlementFeature).map((data) => ({ ...data }));
    this.actor.itemTypes[pf1ks.config.featureId]
      .map((i) => i)
      .sort((a, b) => (a.sort || 0) - (b.sort || 0))
      .forEach((i) => {
        const section = featureSections.find((section) => this._applySectionFilter(i, section));
        if (section) {
          section.items ??= [];
          section.items.push({ ...i, id: i.id });
        }
      });

    const categories = [{ key: "features", sections: featureSections }];
    for (const { key, sections } of categories) {
      const set = this._filters.sections[key];
      for (const section of sections) {
        if (!section) {
          continue;
        }
        section._hidden = set?.size > 0 && !set.has(section.id);
      }
    }

    return { features: featureSections };
  }

  async _onMagicItemDelete(event) {
    event.preventDefault();

    const itemType = event.currentTarget.closest(".magic-item-container").dataset.type;
    const itemId = event.currentTarget.closest(".magic-item").dataset.itemId;

    const magicItems = this.actor.system.magicItems[itemType].items;
    const deletedItem = magicItems.splice(itemId, 1)[0];

    await this._onDelete({
      button: event.currentTarget,
      title: game.i18n.format("PF1.DeleteItemTitle", { name: deletedItem }),
      content: `<p>${game.i18n.localize("PF1.DeleteItemConfirmation")}</p>`,
      onDelete: () =>
        this._onSubmit(event, {
          updateData: { [`system.magicItems.${itemType}.items`]: magicItems },
        }),
    });
  }

  async _onDelete({ button, title, content, onDelete }) {
    if (button.disabled) {
      return;
    }
    button.disabled = true;

    const confirm = await foundry.applications.api.DialogV2.confirm({
      window: { title, icon: "fa-solid fa-trash" },
      classes: ["pf1-v2", "delete-item", "pf1ks"],
      content,
      rejectClose: false,
      modal: true, // Require dialog to be resolved
    });

    if (confirm) {
      onDelete();
    }

    button.disabled = false;
    return confirm;
  }

  // overrides
  _focusTabByItem(item) {
    let tabId;
    switch (item.type) {
      case pf1ks.config.featureId:
        tabId = "features";
        break;
    }

    if (tabId) {
      this.activateTab(tabId, { group: "primary" });
    }
  }

  async _getTooltipContext(fullId, context) {
    const actor = this.actor;
    const actorData = actor.system;

    // Lazy roll data
    const lazy = {
      get rollData() {
        this._cache ??= actor.getRollData();
        return this._cache;
      },
    };

    const getNotes = async (context) =>
      (await actor.getContextNotesParsed(context, { rollData: lazy.rollData, roll: false })).map((n) => n.text);

    let header, subHeader;
    const details = [];
    const paths = [];
    const sources = [];
    let notes;

    const re = /^(?<id>[\w-]+)(?:\.(?<detail>.*))?$/.exec(fullId);
    const { id, detail } = re?.groups ?? {};

    switch (id) {
      case "danger":
      case "maxBaseValue":
      case "purchaseLimit":
      case "spellcasting":
        paths.push({
          path: `@attributes.${id}.total`,
          value: actorData.attributes[id].total,
        });
        sources.push({
          sources: actor.getSourceDetails(`system.attributes.${id}.total`),
          untyped: true,
        });
        break;
      case "alignment":
      case "government":
        Object.entries(pf1ks.config.settlementModifiers).forEach(([mod, label]) => {
          if (actorData.modifiers[mod][id]) {
            paths.push({
              path: label,
              value: actorData.modifiers[mod][id].signedString(),
            });
          }
        });
        if (actorData.attributes.spellcasting[id]) {
          paths.push({
            path: pf1ks.config.settlementAttributes.spellcasting,
            value: actorData.attributes.spellcasting[id].signedString(),
          });
        }
        break;
      case "corruption":
      case "crime":
      case "productivity":
      case "law":
      case "lore":
      case "society":
        paths.push({
          path: `@modifiers.${id}.total`,
          value: actorData.modifiers[id].total,
        });
        sources.push({
          sources: actor.getSourceDetails(`system.modifiers.${id}.total`),
          untyped: true,
        });
        notes = await getNotes(`${pf1ks.config.changePrefix}_${id}`);
        break;
      case "magic-items":
        paths.push(
          {
            path: `@magicItems.${detail}.max`,
            value: actorData.magicItems[detail].max,
          },
          {
            path: `@magicItems.${detail}.current`,
            value: actorData.magicItems[detail].current,
          }
        );
        sources.push({
          sources: actor.getSourceDetails(`system.magicItems.${detail}.max`),
          untyped: true,
        });
        notes = await getNotes(`${pf1ks.config.changePrefix}_magic_item_${detail}`);
        break;

      default:
        throw new Error(`Invalid extended tooltip identifier "${fullId}"`);
    }

    context.header = header;
    context.subHeader = subHeader;
    context.details = details;
    context.paths = paths;
    context.sources = sources;
    context.notes = notes ?? [];
  }
}
