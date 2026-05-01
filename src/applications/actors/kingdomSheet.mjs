import { findLargestSmallerNumber, keepUpdateArray, renameKeys } from "../../util/utils.mjs";

const GRID_COLS = 6;
const GRID_ROWS = 6;

export class KingdomSheet extends pf1.applications.actor.ActorSheetPF {
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
      classes: [...options.classes, "pf1ks", "kingdom"],
      scrollY: [...options.scrollY, ".subdetails-body"],
      height: 940, // TODO this needed?
    };
  }

  get template() {
    return `modules/${pf1ks.config.moduleId}/templates/actors/kingdom/${this.isEditable ? "edit" : "view"}.hbs`;
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
    data.governmentOptions = pf1ks.config.kingdomGovernments;
    data.holidayOptions = pf1ks.config.edicts.holiday;
    data.promotionOptions = pf1ks.config.edicts.promotion;
    data.taxationOptions = pf1ks.config.edicts.taxation;

    // summary
    data.governmentLabel = pf1ks.config.kingdomGovernments[actorData.government];

    // kingdom stats
    data.stats = [];
    for (const [stat, label] of Object.entries(pf1ks.config.kingdomStats)) {
      data.stats.push({ id: stat, label, value: actorData[stat] });
    }

    // kingdom modifiers
    data.modifiers = Object.entries(pf1ks.config.settlementModifiers).map(([key, label]) => ({
      id: key,
      value: actorData.modifiers[key],
      label,
    }));

    // actions per turn
    const sizeBonus = findLargestSmallerNumber(
      Object.keys(pf1ks.config.actionsPerTurn).map((k) => Number(k)),
      actorData.size || 1
    );
    const { fame, ...perTurnRaw } = pf1ks.config.actionsPerTurn[sizeBonus];
    const perTurn = renameKeys(perTurnRaw, pf1ks.config.actionsPerTurnLabels);
    data.perTurn = perTurn;
    data.infinity = Infinity;

    // non-viceroy leadership
    data.leaders = Object.entries(actorData.leadership).reduce((acc, [key, leader]) => {
      if (key === "viceroys") {
        return acc;
      }

      const data = {
        roleLabel: pf1ks.config.leadershipRoles[leader.role],
        key,
        actorId: leader.actorId,
        skillBonus: leader.skillBonus,
        skillBonusLabel: pf1ks.config.leadershipSkillBonuses[leader.skillBonusType],
        bonus: leader.bonus,
        showSelector: false,
        bonusType: leader.bonusType,
        bonusTypeLabel: pf1ks.config.leadershipBonusOptions[leader.bonusType],
      };
      if (leader.role === "ruler") {
        data.showSelector = actorData.size < 101;
        data.bonusOptions = actorData.size < 26 ? pf1ks.config.kingdomStats : pf1ks.config.leadershipBonusTwoStats;
      } else if (leader.role === "spymaster") {
        data.showSelector = true;
        data.bonusOptions = pf1ks.config.kingdomStats;
      }

      acc.push(data);
      return acc;
    }, []);

    // viceroys
    data.viceroys = actorData.leadership.viceroys.map((viceroy) => {
      return {
        id: viceroy.id,
        roleLabel: pf1ks.config.leadershipRoles[viceroy.role],
        actorId: viceroy.actorId,
        skillBonus: viceroy.skillBonus,
        skillBonusLabel: pf1ks.config.leadershipSkillBonuses[viceroy.skillBonusType],
        bonus: viceroy.bonus,
        bonusTypeLabel: pf1ks.config.leadershipBonusOptions[viceroy.bonusType],
      };
    });

    const leadershipOptions = { "": "" };
    game.actors
      .filter((actor) => actor.permission > 0 && (actor.type === "character" || actor.type === "npc"))
      .forEach((actor) => (leadershipOptions[actor.id] = actor.name));
    data.validLeadershipOptions = leadershipOptions;

    data.sections = this._prepareItems();

    // settlements
    data.settlements = this._prepareSettlements();

    // terrain
    data.terrain = Object.entries(actorData.terrain).map(([key, value]) => ({
      key,
      value,
      label: pf1ks.config.terrainTypes[key],
    }));

    // events
    data.eventChance = actorData.eventLastTurn ? 25 : 75;

    // armies
    data.armies = this._prepareArmies();

    // optional rules
    data.settings = this._prepareSettings();
    data.optionalRules = this._prepareOptionalRules();

    // notifications
    if (actorData.unrest > 10 && actorData.unrest < 20) {
      data.unrestError = game.i18n.localize("PF1KS.UnrestWarning");
    }
    if (actorData.unrest > 19) {
      data.unrestError = game.i18n.localize("PF1KS.UnrestError");
    }
    if (actorData.fame.base + actorData.infamy.base > fame) {
      data.fameInfamyError = game.i18n.localize("PF1KS.FamyInfamyError");
    }
    if (actorData.fame.base + actorData.infamy.base < fame) {
      data.fameInfamyError = game.i18n.localize("PF1KS.MissingFamyInfamyError");
    }

    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find(".governmentForms").on("change", (e) => this._onGovernmentToggle(e));
    html.find(".secondRuler").on("change", (e) => this._onSecondRulerToggle(e));
    html.find(".item-toggle-data").on("click", (e) => this._itemToggleData(e));

    html.find(".kingdom-stat .rollable").on("click", (e) => this._onRollKingdomStat(e));
    html.find(".event-chance .rollable").on("click", (e) => this._onRollEventChance(e));

    html.find(".viceroy-create").on("click", (e) => this._onViceroyCreate(e));
    html.find(".viceroy-delete").on("click", (e) => this._onViceroyDelete(e));

    html.find(".settlement-create").on("click", (e) => this._onSettlementCreate(e));
    html.find(".settlement-edit").on("click", (e) => this._onSettlementEdit(e));
    html.find(".settlement-delete").on("click", (e) => this._onSettlementDelete(e));

    html.find(".army-create").on("click", (e) => this._onArmyCreate(e));
    html.find(".army-edit").on("click", (e) => this._onArmyEdit(e));
    html.find(".army-delete").on("click", (e) => this._onArmyDelete(e));
  }

  _prepareItems() {
    const terrainSections = Object.values(pf1.config.sheetSections.kingdomTerrain).map((data) => ({ ...data }));
    this.actor.itemTypes[pf1ks.config.improvementId]
      .map((i) => i)
      .sort((a, b) => (a.sort || 0) - (b.sort || 0))
      .forEach((i) => {
        const section = terrainSections.find((section) => this._applySectionFilter(i, section));
        if (section) {
          section.items ??= [];
          section.items.push({ ...i, id: i.id, isEmpty: i.system.quantity === 0 });
        }
      });

    const eventsSections = Object.values(pf1.config.sheetSections.kingdomEvent).map((data) => ({ ...data }));
    this.actor.itemTypes[pf1ks.config.kingdomEventId]
      .map((i) => i)
      .sort((a, b) => (a.sort || 0) - (b.sort || 0))
      .forEach((e) => {
        const section = eventsSections.find((section) => this._applySectionFilter(e, section));
        if (section) {
          section.items ??= [];
          section.items.push({ ...e, id: e.id });
        }
      });
    this.actor.system.settlementProxies
      .flatMap((proxy) => proxy.actor.itemTypes[pf1ks.config.settlementEventId])
      .map((i) => i)
      .sort((a, b) => (a.sort || 0) - (b.sort || 0))
      .forEach((e) => {
        const section = eventsSections.find((section) => this._applySectionFilter(e, section));
        if (section) {
          section.items ??= [];
          section.items.push({
            ...e,
            id: e.id,
            settlementName: e.parent.name,
          });
        }
      });

    const categories = [
      { key: "terrain", sections: terrainSections },
      { key: "events", sections: eventsSections },
    ];
    for (const { key, sections } of categories) {
      const set = this._filters.sections[key];
      for (const section of sections) {
        if (!section) {
          continue;
        }
        section._hidden = set?.size > 0 && !set.has(section.id);
      }
    }

    return { terrain: terrainSections, events: eventsSections };
  }

  _prepareArmies() {
    return this.actor.system.armies.map((army) => ({
      id: army.id,
      img: army.actor.img,
      name: army.actor.name,
      system: army.actor.system,
    }));
  }

  _prepareSettlements() {
    return this.actor.system.settlementProxies.map(({ id, actor }) => ({
      id,
      img: actor.img,
      name: actor.name,
      system: {
        ...actor.system,
        attributes: {
          ...actor.system.attributes,
          size: pf1ks.config.settlementSizes[actor.system.attributes.size],
        },
      },
    }));
  }

  _prepareSettings() {
    return Object.entries(this.actor.system.settings)
      .filter(([_, value]) => typeof value === "boolean")
      .map(([key, value]) => ({
        name: key,
        value,
        label: pf1ks.config.settings[key],
      }));
  }

  _prepareOptionalRules() {
    return Object.entries(this.actor.system.settings.optionalRules).map(([key, value]) => ({
      name: key,
      value,
      label: pf1ks.config.optionalRules[key],
      compendiumEntry: pf1ks.config.compendiumEntries[key],
    }));
  }

  _onGovernmentToggle(event) {
    if (!event.target.checked) {
      this.actor.update({ "system.government": "aut" });
    }
  }

  _onSecondRulerToggle(event) {
    if (event.target.checked) {
      this.actor.update({ "system.leadership.consort": { bonusType: "", role: "ruler" } });
    } else {
      this.actor.update({ "system.leadership.consort": { bonusType: "loyalty", role: "consort" } });
    }
  }

  async _itemToggleData(event) {
    event.preventDefault();
    const el = event.currentTarget;

    const itemId = el.closest(".item").dataset.itemId;
    const item = this.actor.items.get(itemId);
    const property = el.dataset.name;

    const updateData = { system: {} };
    foundry.utils.setProperty(updateData.system, property, !foundry.utils.getProperty(item.system, property));

    item.update(updateData);
  }

  async _onRollKingdomStat(event) {
    event.preventDefault();
    const kingdomStat = event.currentTarget.closest(".kingdom-stat").dataset.kingdomStat;
    this.actor.rollKingdomStat(kingdomStat, { actor: this.actor });
  }

  async _onRollEventChance(event) {
    event.preventDefault();
    this.actor.rollEvent({ actor: this.actor });
  }

  async _onViceroyCreate(event) {
    event.preventDefault();

    const viceroys = foundry.utils.duplicate(this.actor.system.leadership.viceroys ?? []);
    viceroys.push({
      role: "viceroy",
    });

    await this._onSubmit(event, {
      updateData: { "system.leadership.viceroys": viceroys },
    });
  }

  async _onViceroyDelete(event) {
    event.preventDefault();

    const viceroyId = event.currentTarget.closest(".item").dataset.itemId;
    const viceroys = foundry.utils.duplicate(this.actor.system.leadership.viceroys ?? []);
    viceroys.findSplice((viceroy) => viceroy.id === viceroyId);

    await this._onDelete({
      button: event.currentTarget,
      title: game.i18n.localize("PF1KS.DeleteViceroy"),
      content: `<p>${game.i18n.localize("PF1KS.DeleteViceroyConfirmation")}</p>`,
      onDelete: () =>
        this._onSubmit(event, {
          updateData: { "system.leadership.viceroys": viceroys },
        }),
    });
  }

  async _onSettlementCreate(event) {
    event.preventDefault();

    const newSettlement = await Actor.create({
      name: game.i18n.localize("PF1KS.NewSettlement"),
      type: pf1ks.config.settlementId,
      "prototypeToken.actorLink": true,
    });

    return this._createSettlement(newSettlement._id);
  }

  async _createSettlement(actorId) {
    const settlements = foundry.utils.duplicate(this.actor.system.settlementProxies ?? []);
    settlements.push({
      id: foundry.utils.randomID(),
      actor: actorId,
    });

    // add the kingdom link to the settlement
    const settlement = await fromUuid(`Actor.${actorId}`);
    await settlement.update({
      "system.kingdom": {
        id: foundry.utils.randomID(),
        actor: this.actor._id,
      },
    });

    await this._onSubmit(event, {
      updateData: { "system.settlementProxies": settlements },
    });
  }

  async _onSettlementEdit(event) {
    event.preventDefault();
    const settlementId = event.currentTarget.closest(".item").dataset.id;
    const settlement = this.actor.system.settlementProxies.find((settlement) => settlement.id === settlementId);

    settlement.actor.sheet.render(true, { focus: true });
  }

  async _onSettlementDelete(event) {
    event.preventDefault();

    const settlementId = event.currentTarget.closest(".item").dataset.id;
    const settlements = foundry.utils.duplicate(this.actor.system.settlementProxies ?? []);
    const deletedSettlement = settlements.findSplice((settlement) => settlement.id === settlementId);
    const deletedSettlementActor = this.actor.system.settlementProxies.find(
      (settlement) => settlement.id === deletedSettlement.id
    ).actor;

    await this._onDelete({
      button: event.currentTarget,
      title: game.i18n.format("PF1KS.DeleteSettlementTitle", { name: deletedSettlementActor?.name }),
      content: `<p>${game.i18n.localize("PF1KS.DeleteSettlementConfirmation")}</p>`,
      onDelete: async () => {
        await this._onSubmit(event, {
          updateData: { "system.settlementProxies": settlements },
        });

        await deletedSettlementActor.update({
          "system.-=kingdom": null,
        });
      },
    });
  }

  async _onArmyCreate(event) {
    event.preventDefault();

    const newArmy = await Actor.create({
      name: game.i18n.localize("PF1KS.NewArmy"),
      type: pf1ks.config.armyId,
      "prototypeToken.actorLink": true,
    });

    return this._createArmy(newArmy._id);
  }

  async _createArmy(actorId) {
    const armies = foundry.utils.duplicate(this.actor.system.armies ?? []);
    armies.push({
      id: foundry.utils.randomID(),
      actor: actorId,
    });

    // add the kingdom link to the army
    const army = await fromUuid(`Actor.${actorId}`);
    await army.update({
      "system.kingdom": {
        id: foundry.utils.randomID(),
        actor: this.actor._id,
      },
    });

    await this._onSubmit(event, {
      updateData: { "system.armies": armies },
    });
  }

  async _onArmyEdit(event) {
    event.preventDefault();
    const armyId = event.currentTarget.closest(".item").dataset.id;
    const army = this.actor.system.armies.find((army) => army.id === armyId);

    army.actor.sheet.render(true, { focus: true });
  }

  async _onArmyDelete(event) {
    event.preventDefault();

    const armyId = event.currentTarget.closest(".item").dataset.id;
    const armies = foundry.utils.duplicate(this.actor.system.armies ?? []);
    const deletedArmy = armies.findSplice((army) => army.id === armyId);
    const deletedArmyActor = this.actor.system.armies.find((army) => army.id === deletedArmy.id).actor;

    await this._onDelete({
      button: event.currentTarget,
      title: game.i18n.format("PF1KS.DeleteArmyTitle", { name: deletedArmyActor?.name }),
      content: `<p>${game.i18n.localize("PF1KS.DeleteArmyConfirmation")}</p>`,
      onDelete: async () => {
        await this._onSubmit(event, {
          updateData: { "system.armies": armies },
        });

        await deletedArmyActor.update({
          "system.-=kingdom": null,
        });
      },
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
  }

  // overrides
  // allows dropping settlements and armies onto kingdoms
  async _onDropActor(event, data) {
    event.preventDefault();

    const actorData = await Actor.fromDropData(data);

    if (actorData.type !== pf1ks.config.settlementId && actorData.type !== pf1ks.config.armyId) {
      return false;
    }

    // settlement/army is already linked
    if (actorData.kingdom) {
      ui.notifications.warn("PF1KS.SettlementArmyAlreadyLinked", { localize: true });
      return false;
    }

    const source = actorData._stats.compendiumSource.split(".")[0];

    let actor;
    if (source === "Actor") {
      actor = await fromUuid(data.uuid);
    } else {
      actor = await Actor.create(actorData.toObject());
    }

    let created;
    if (actor.type === pf1ks.config.settlementId) {
      created = await this._createSettlement(actor._id);
      this.activateTab("settlements", { group: "primary" });
    } else {
      created = await this._createArmy(actor._id);
      this.activateTab("armies", { group: "primary" });
    }
    return created;
  }

  _focusTabByItem(item) {
    let tabId;
    switch (item.type) {
      case pf1ks.config.improvementId:
        tabId = "terrain";
        break;
      case pf1ks.config.kingdomEventId:
        tabId = "events";
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
      case "controlDC":
        paths.push({
          path: "@controlDC",
          value: actorData.controlDC,
        });
        sources.push({
          sources: actor.getSourceDetails("system.controlDC"),
          untyped: true,
        });
        break;
      case "economy":
      case "loyalty":
      case "stability":
      case "bonusBP":
      case "consumption":
        paths.push({
          path: `@${id}.total`,
          value: actorData[id].total,
        });
        sources.push({
          sources: actor.getSourceDetails(`system.${id}.total`),
          untyped: true,
        });
        notes = await getNotes(`${pf1ks.config.changePrefix}_${id}`);
        break;
      case "bpStorage":
        paths.push(
          {
            path: "@bpStorage.current",
            value: actorData.bpStorage.current,
          },
          {
            path: "@bpStorage.max",
            value: actorData.bpStorage.max,
          }
        );
        sources.push({
          sources: actor.getSourceDetails("system.bpStorage.max"),
          untyped: true,
        });
        break;
      case "holiday":
        if (actorData.edicts[id]) {
          paths.push(
            {
              path: game.i18n.localize("PF1KS.Loyalty"),
              value: pf1ks.config.edictEffects[id][actorData.edicts[id]].loyalty.signedString(),
            },
            {
              path: game.i18n.localize("PF1KS.Consumption"),
              value: pf1ks.config.edictEffects[id][actorData.edicts[id]].consumption.signedString(),
            }
          );
        }
        break;
      case "promotion":
        if (actorData.edicts[id]) {
          paths.push(
            {
              path: game.i18n.localize("PF1KS.Stability"),
              value: pf1ks.config.edictEffects[id][actorData.edicts[id]].stability.signedString(),
            },
            {
              path: game.i18n.localize("PF1KS.Consumption"),
              value: pf1ks.config.edictEffects[id][actorData.edicts[id]].consumption.signedString(),
            }
          );
        }
        break;
      case "taxation":
        if (actorData.edicts[id]) {
          paths.push(
            {
              path: game.i18n.localize("PF1KS.Economy"),
              value: pf1ks.config.edictEffects[id][actorData.edicts[id]].economy.signedString(),
            },
            {
              path: game.i18n.localize("PF1KS.Loyalty"),
              value: pf1ks.config.edictEffects[id][actorData.edicts[id]].loyalty.signedString(),
            }
          );
        }
        break;
      case "government":
        Object.entries(pf1ks.config.settlementModifiers).forEach(([mod, label]) => {
          if (actorData.modifiers[mod].government) {
            paths.push({
              path: label,
              value: actorData.modifiers[mod].government.signedString(),
            });
          }
        });
        break;
      case "alignment":
        Object.entries(pf1ks.config.kingdomStats).forEach(([stat, label]) => {
          const value = pf1ks.config.alignmentEffects[actorData.alignment]?.[stat];
          if (value) {
            paths.push({
              path: label,
              value: value.signedString(),
            });
          }
        });
        Object.entries(pf1ks.config.settlementModifiers).forEach(([mod, label]) => {
          if (actorData.modifiers[mod].alignment) {
            paths.push({
              path: label,
              value: actorData.modifiers[mod].alignment.signedString(),
            });
          }
        });
        break;
      case "fame":
      case "infamy":
        paths.push(
          {
            path: `@${id}.base`,
            value: actorData[id].base,
          },
          {
            path: `@${id}.total`,
            value: actorData[id].total,
          }
        );
        sources.push({
          sources: actor.getSourceDetails(`system.${id}.total`),
          untyped: true,
        });
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
