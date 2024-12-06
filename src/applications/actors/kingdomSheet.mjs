import { findLargestSmallerNumber, renameKeys } from "../../util/utils.mjs";

export class KingdomSheet extends pf1.applications.actor.ActorSheetPF {
  static get defaultOptions() {
    const options = super.defaultOptions;
    return {
      ...options,
      classes: [...options.classes, "kingdom"],
      tabs: [
        {
          navSelector: "nav.tabs[data-group='primary']",
          contentSelector: "section.primary-body",
          initial: "summary",
          group: "primary",
        },
        {
          navSelector: "nav.tabs[data-group='settlements']",
          contentSelector: "section.settlements-body",
          initial: "0",
          group: "settlements",
        },
      ],
    };
  }

  get template() {
    return `modules/${pf1ks.config.CFG.id}/templates/actors/kingdom/${this.isEditable ? "edit" : "view"}.hbs`;
  }

  async getData() {
    // needed to make sure the leadership actor links are updated todo can I move this to the data model preparederiveddata? like i do for armies
    this.actor.prepareData();

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
      stats: [
        {
          id: "economy",
          label: game.i18n.localize("PF1KS.Economy"),
        },
        {
          id: "loyalty",
          label: game.i18n.localize("PF1KS.Loyalty"),
        },
        {
          id: "stability",
          label: game.i18n.localize("PF1KS.Stability"),
        },
      ],
    };

    // notifications
    // TODO unrest > 10 warning -> lose 1 hex a turn
    // TODO unrest > 19 error -> kingdom in anarchy
    // TODO any unrest increases such as from vacancies
    // Base fame+infamy < expected

    // selectors
    data.alignmentOptions = pf1.config.alignments;
    data.governmentOptions = pf1ks.config.kingdomGovernments;
    data.holidayOptions = pf1ks.config.edicts.holiday;
    data.promotionOptions = pf1ks.config.edicts.promotion;
    data.taxationOptions = pf1ks.config.edicts.taxation;

    // summary
    data.governmentLabel = pf1ks.config.kingdomGovernments[actorData.government];

    // kingdom stats
    for (const abl of data.stats) {
      abl.data = actorData[abl.id];
    }

    // kingdom modifiers
    data.modifiers = Object.entries(pf1ks.config.settlementModifiers).map(([key, label]) => ({
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
    data.buildingType = pf1ks.config.kingdomBuildingId;
    data.settlements = this._prepareSettlements();
    data.noSettlementBuildings = this.actor.itemTypes[pf1ks.config.kingdomBuildingId].filter(
      (building) => !actorData.settlements.map((s) => s.id).includes(building.system.settlementId)
    );

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
    data.optionalRules = this._prepareOptionalRules();

    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find(".governmentForms").on("change", (e) => this._onGovernmentToggle(e));
    html.find(".secondRuler").on("change", (e) => this._onSecondRulerToggle(e));

    html.find(".kingdom-stat .rollable").on("click", (e) => this._onRollKingdomStat(e));
    html.find(".event-chance .rollable").on("click", (e) => this._onRollEventChance(e));

    html.find(".viceroy-create").on("click", (e) => this._onViceroyCreate(e));
    html.find(".viceroy-delete").on("click", (e) => this._onViceroyDelete(e));

    html.find(".settlement-create").on("click", (e) => this._onSettlementCreate(e));
    html.find(".settlement-delete").on("click", (e) => this._onSettlementDelete(e));

    html.find(".army-create").on("click", (e) => this._onArmyCreate(e));
    html.find(".army-edit").on("click", (e) => this._onArmyEdit(e));
    html.find(".army-delete").on("click", (e) => this._onArmyDelete(e));
  }

  _prepareItems() {
    const [improvements, events] = this.actor.items.reduce(
      (arr, item) => {
        if (item.type === pf1ks.config.kingdomImprovementId) {
          arr[0].push(item);
        } else if (item.type === pf1ks.config.kingdomEventId) {
          arr[1].push(item);
        }
        return arr;
      },
      [[], []]
    );

    const terrainSections = Object.values(pf1.config.sheetSections.kingdomTerrain).map((data) => ({ ...data }));
    for (const i of improvements) {
      const section = terrainSections.find((section) => this._applySectionFilter(i, section));
      if (section) {
        section.items ??= [];
        section.items.push(i);
      }
    }

    const eventsSections = Object.values(pf1.config.sheetSections.kingdomEvent).map((data) => ({ ...data }));
    for (const i of events) {
      const section = eventsSections.find((section) => this._applySectionFilter(i, section));
      if (section) {
        section.items ??= [];
        section.items.push(i);
      }
    }

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

  _prepareSettlements() {
    return this.actor.system.settlements.map((settlement) => {
      const { defense, baseValue, ...modifiers } = settlement.modifiers;

      return {
        ...settlement,
        defense,
        baseValue,
        modifiers: Object.entries(modifiers).map(([key, value]) => ({
          label: pf1ks.config.settlementModifiers[key],
          value: value.total,
          kingdomValue: this.actor.system.modifiers?.[key].total,
        })),
        sizeLabel: pf1ks.config.settlementSizes[settlement.size],
        buildings: this.actor.itemTypes[pf1ks.config.kingdomBuildingId].filter(
          (building) => building.system.settlementId === settlement.id
        ),
      };
    });
  }

  _prepareArmies() {
    return this.actor.system.armies.map((army) => ({
      id: army.id,
      img: army.actor.img,
      name: army.actor.name,
      system: army.actor.system,
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

    const viceroyId = event.currentTarget.closest(".item").dataset.id;
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

    const newIdx = this.actor.system.settlements.length;
    const settlements = foundry.utils.duplicate(this.actor.system.settlements ?? []);
    settlements.push({
      name: game.i18n.format("PF1KS.NewSettlementLabel", { number: newIdx + 1 }),
      id: foundry.utils.randomID(),
      districtCount: 1,
    });

    await this._onSubmit(event, {
      updateData: { "system.settlements": settlements },
    });

    this.activateTab(`${newIdx}`, { group: "settlements" });
  }

  async _onSettlementDelete(event) {
    event.preventDefault();

    const settlementId = event.currentTarget.closest(".settlement").dataset.id;
    const settlements = foundry.utils.duplicate(this.actor.system.settlements ?? []);
    const deletedSettlement = settlements.findSplice((settlement) => settlement.id === settlementId);

    await this._onDelete({
      button: event.currentTarget,
      title: game.i18n.format("PF1KS.DeleteSettlementTitle", { name: deletedSettlement.name }),
      content: `<p>${game.i18n.localize("PF1KS.DeleteSettlementConfirmation")}</p>`,
      onDelete: () =>
        this._onSubmit(event, {
          updateData: { "system.settlements": settlements },
        }),
    });

    const buildingIdsToDelete = this.actor.itemTypes[pf1ks.config.kingdomBuildingId]
      .filter((building) => building.system.settlementId === settlementId)
      .map((building) => building._id);

    await this.actor.deleteEmbeddedDocuments("Item", buildingIdsToDelete);
  }

  async _onArmyCreate(event) {
    event.preventDefault();

    const newArmy = await Actor.create({
      name: game.i18n.localize("PF1KS.NewArmy"),
      type: pf1ks.config.kingdomArmyId,
    });

    return this._createArmy(newArmy._id);
  }

  async _createArmy(actorId) {
    const armies = foundry.utils.duplicate(this.actor.system.armies ?? []);
    armies.push({
      id: foundry.utils.randomID(),
      actor: actorId,
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
      onDelete: async () =>
        await this._onSubmit(event, {
          updateData: { "system.armies": armies },
        }),
    });
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

  // overrides
  async _onDropItem(event, data) {
    if (!this.actor.isOwner) {
      return void ui.notifications.warn("PF1.Error.NoActorPermission", { localize: true });
    }

    const sourceItem = await Item.implementation.fromDropData(data);
    const settlementId = event.target.closest(".tab.settlement")?.dataset.id;

    const sameActor = sourceItem.actor === this.actor && !data.containerId;

    const itemData = game.items.fromCompendium(sourceItem, {
      clearFolder: true,
      keepId: sameActor,
      clearSort: !sameActor,
    });

    // Handle item sorting within the same actor
    if (sameActor) {
      return this._onSortItem(event, itemData);
    }

    // Create the owned item
    this._alterDropItemData(itemData, sourceItem);

    // if building dropped on a settlement, add the settlement id
    if (itemData.type === pf1ks.config.kingdomBuildingId && settlementId) {
      itemData.system.settlementId = settlementId;
    }

    return this._onDropItemCreate(itemData);
  }

  // allows dropping armies onto kingdoms
  async _onDropActor(event, data) {
    event.preventDefault();

    const actorData = await Actor.fromDropData(data);

    if (actorData.type !== pf1ks.config.kingdomArmyId) {
      return false;
    }

    const source = actorData.getFlag("core", "sourceId").split(".")[0];

    let army;
    if (source === "Actor") {
      army = await fromUuid(data.uuid);
    } else {
      army = await Actor.create(actorData.toObject());
    }

    const created = await this._createArmy(army._id);
    this.activateTab("armies", "primary");
    return created;
  }

  _focusTabByItem(item) {
    let tabId;
    switch (item.type) {
      case pf1ks.config.kingdomBuildingId:
        tabId = "settlements";
        break;
      case pf1ks.config.kingdomImprovementId:
        tabId = "terrain";
        break;
      case pf1ks.config.kingdomEventId:
        tabId = "events";
        break;
      default:
        tabId = "summary";
    }

    if (tabId) {
      this.activateTab(tabId, "primary");
    }
  }

  _getTooltipContext(fullId, context) {
    const actor = this.actor;
    const actorData = actor.system;

    // Lazy roll data
    const lazy = {
      get rollData() {
        this._rollData ??= actor.getRollData();
        return this._rollData;
      },
    };

    const getSource = (path) => this.actor.sourceDetails[path];

    const getNotes = (context, all = true) => {
      const noteObjs = actor.getContextNotes(context, all);
      return actor.formatContextNotes(noteObjs, lazy.rollData, { roll: false });
    };

    let header, subHeader;
    const details = [];
    const paths = [];
    const sources = [];
    let notes;

    const re = /^(?<id>[\w-]+)(?:\.(?<detail>.*))?$/.exec(fullId);
    const { id } = re?.groups ?? {};

    switch (id) {
      case "controlDC":
        paths.push({
          path: "@controlDC",
          value: actorData.controlDC,
        });
        sources.push({
          sources: getSource("system.controlDC"),
          untyped: true,
        });
        break;
      case "consumption":
        paths.push({
          path: "@consumption.total",
          value: actorData.consumption.total,
        });
        sources.push({
          sources: getSource("system.consumption.total"),
          untyped: true,
        });
        notes = getNotes(`${pf1ks.config.CFG.changePrefix}_consumption`);
        break;
      case "economy":
      case "loyalty":
      case "stability":
        paths.push({
          path: `@${id}.total`,
          value: actorData[id].total,
        });
        sources.push({
          sources: getSource(`system.${id}.total`),
          untyped: true,
        });
        notes = getNotes(`${pf1ks.config.CFG.changePrefix}_${id}`);
        break;
      case "fame":
        paths.push(
          {
            path: "@fame.base",
            value: actorData.fame.base,
          },
          {
            path: "@fame.total",
            value: actorData.fame.total,
          }
        );
        sources.push({
          sources: getSource("system.fame.total"),
          untyped: true,
        });
        notes = getNotes(`${pf1ks.config.CFG.changePrefix}_fame`);
        break;
      case "infamy":
        paths.push(
          {
            path: "@infamy.base",
            value: actorData.infamy.base,
          },
          {
            path: "@infamy.total",
            value: actorData.infamy.total,
          }
        );
        sources.push({
          sources: getSource("system.infamy.total"),
          untyped: true,
        });
        notes = getNotes(`${pf1ks.config.CFG.changePrefix}_infamy`);
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
