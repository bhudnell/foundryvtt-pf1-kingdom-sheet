import {
  CFG,
  alignments,
  edicts,
  kingdomBuildingId,
  kingdomEventId,
  kingdomGovernments,
  kingdomImprovementId,
  kingdomStats,
  actionsPerTurnLabels,
  actionsPerTurn,
  settlementSizes,
  terrainTypes,
  itemSubTypes,
  leadershipSkillBonuses,
  settlementModifiers,
  leadershipRoles,
  leadershipBonusOptions,
  leadershipBonusTwoStats,
  kingdomArmyId,
  compendiumEntries,
  optionalRules,
} from "../../config.mjs";
import { findLargestSmallerNumber, renameKeys } from "../../utils.mjs";

export class KingdomSheet extends ActorSheet {
  constructor(...args) {
    super(...args);

    this._expandedItems = new Set();
  }
  static get defaultOptions() {
    const options = super.defaultOptions;
    return {
      ...options,
      template: `modules/${CFG.id}/templates/actors/kingdom/kingdom-sheet.hbs`,
      classes: [...options.classes, "pf1", "actor", "kingdom"],
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

  async getData() {
    // needed to make sure the leadership actor links are updated
    this.actor.prepareData();

    const actor = this.actor;
    const actorData = actor.system;

    const data = {
      ...this.actor,
      enrichedNotes: await TextEditor.enrichHTML(actorData.notes),
      editable: this.isEditable,
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

    // dropdowns
    data.alignmentOptions = Object.fromEntries(
      Object.entries(alignments).map(([key, label]) => [key, game.i18n.localize(label)])
    );
    data.governmentOptions = Object.fromEntries(
      Object.entries(kingdomGovernments).map(([key, label]) => [key, game.i18n.localize(label)])
    );
    data.holidayOptions = Object.fromEntries(
      Object.entries(edicts.holiday).map(([key, label]) => [key, game.i18n.localize(label)])
    );
    data.promotionOptions = Object.fromEntries(
      Object.entries(edicts.promotion).map(([key, label]) => [key, game.i18n.localize(label)])
    );
    data.taxationOptions = Object.fromEntries(
      Object.entries(edicts.taxation).map(([key, label]) => [key, game.i18n.localize(label)])
    );

    // summary
    data.governmentLabel = game.i18n.localize(kingdomGovernments[actorData.government]);

    // kingdom stats
    for (const abl of data.stats) {
      abl.data = actorData[abl.id];
    }

    // kingdom modifiers
    data.modifiers = Object.entries(settlementModifiers).reduce((acc, [key, value]) => {
      acc.push({ value: actorData.modifiers[key], label: game.i18n.localize(value) });
      return acc;
    }, []);

    // actions per turn
    const sizeBonus = findLargestSmallerNumber(
      Object.keys(actionsPerTurn).map((k) => Number(k)),
      actorData.size || 1
    );
    const { fame, ...perTurnRaw } = actionsPerTurn[sizeBonus];
    const perTurn = renameKeys(perTurnRaw, actionsPerTurnLabels);
    data.perTurn = perTurn;
    data.infinity = Infinity;

    // non-viceroy leadership
    data.leaders = Object.entries(actorData.leadership).reduce((acc, [key, leader]) => {
      if (key === "viceroys") {
        return acc;
      }

      const data = {
        roleLabel: game.i18n.localize(leadershipRoles[leader.role]),
        key,
        actorId: leader.actorId,
        skillBonus: leader.skillBonus,
        skillBonusLabel: game.i18n.localize(leadershipSkillBonuses[leader.skillBonusType]),
        bonus: leader.bonus,
        showSelector: false,
        bonusType: leader.bonusType,
        bonusTypeLabel: game.i18n.localize(leadershipBonusOptions[leader.bonusType]),
      };
      if (leader.role === "ruler") {
        data.showSelector = actorData.size < 101;
        data.bonusOptions = Object.fromEntries(
          Object.entries(actorData.size < 26 ? kingdomStats : leadershipBonusTwoStats).map(([key, label]) => [
            key,
            game.i18n.localize(label),
          ])
        );
      } else if (leader.role === "spymaster") {
        data.showSelector = true;
        data.bonusOptions = Object.fromEntries(
          Object.entries(kingdomStats).map(([key, label]) => [key, game.i18n.localize(label)])
        );
      }

      acc.push(data);
      return acc;
    }, []);

    // viceroys
    data.viceroys = actorData.leadership.viceroys.map((viceroy) => {
      return {
        id: viceroy.id,
        roleLabel: game.i18n.localize(leadershipRoles[viceroy.role]),
        actorId: viceroy.actorId,
        skillBonus: viceroy.skillBonus,
        skillBonusLabel: game.i18n.localize(leadershipSkillBonuses[viceroy.skillBonusType]),
        bonus: viceroy.bonus,
        bonusTypeLabel: game.i18n.localize(leadershipBonusOptions[viceroy.bonusType]),
      };
    });

    const leadershipChoices = { "": "" };
    game.actors
      .filter((actor) => actor.permission > 0 && (actor.type === "character" || actor.type === "npc"))
      .forEach((actor) => (leadershipChoices[actor.id] = actor.name));
    data.validLeadershipChoices = leadershipChoices;

    // settlements
    data.buildingType = kingdomBuildingId;
    data.settlements = this._prepareSettlements();
    data.noSettlementBuildings = this.actor.itemTypes[kingdomBuildingId].filter(
      (building) => !actorData.settlements.map((s) => s.id).includes(building.system.settlementId)
    );

    // terrain
    data.improvementSections = this._prepareImprovements();
    data.improvementType = kingdomImprovementId;
    data.terrain = Object.entries(actorData.terrain).reduce((acc, [key, value]) => {
      acc[key] = { value, label: game.i18n.localize(terrainTypes[key]) };
      return acc;
    }, {});

    // events
    data.eventSections = this._prepareEvents();
    data.eventType = kingdomEventId;
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

    html.find(".item-delete").on("click", (e) => this._onItemDelete(e));
    html.find(".item-duplicate").on("click", (e) => this._onItemDuplicate(e));
    html.find(".item-edit").on("click", (e) => this._onItemEdit(e));
    html.find(".item-create").on("click", (e) => this._onItemCreate(e));

    html.find("a.compendium-entry").on("click", (e) => this._onOpenCompendiumEntry(e));
  }

  async _onDropItem(event, data) {
    const sourceItem = await Item.fromDropData(data);
    const settlementId = event.target.closest(".tab.settlement")?.dataset.id;

    const itemData = sourceItem.toObject();

    if (itemData.type === kingdomBuildingId && settlementId) {
      itemData.system.settlementId = settlementId;
    }

    return this.actor.createEmbeddedDocuments("Item", [itemData]);
  }

  // allows dropping armies onto kingdoms
  async _onDropActor(event, data) {
    event.preventDefault();

    const actorData = await Actor.fromDropData(data);

    if (actorData.type !== kingdomArmyId) {
      return false;
    }

    const source = actorData.getFlag("core", "sourceId").split(".")[0];

    let army;
    if (source === "Actor") {
      army = await fromUuid(data.uuid);
    } else {
      army = await Actor.create(actorData.toObject());
    }

    return this._createArmy(army._id);
  }

  _prepareImprovements() {
    const improvements = this.actor.itemTypes[kingdomImprovementId];
    const general = {
      label: game.i18n.localize("PF1KS.Improvement.SubTypes.General"),
      subType: "general",
      improvements: [],
    };
    const special = {
      label: game.i18n.localize("PF1KS.Improvement.SubTypes.Special"),
      subType: "special",
      improvements: [],
    };
    improvements.forEach((improvement) => {
      if (improvement.system.subType === general.subType) {
        general.improvements.push(improvement);
      } else if (improvement.system.subType === special.subType) {
        special.improvements.push(improvement);
      }
    });

    return [general, special];
  }

  _prepareEvents() {
    const events = this.actor.itemTypes[kingdomEventId];
    const active = {
      label: game.i18n.localize("PF1KS.Event.SubTypes.Active"),
      subType: "active",
      events: [],
    };
    const misc = {
      label: game.i18n.localize("PF1KS.Event.SubTypes.Misc"),
      subType: "misc",
      events: [],
    };
    events.forEach((event) => {
      if (event.system.subType === active.subType) {
        active.events.push(event);
      } else if (event.system.subType === misc.subType) {
        misc.events.push(event);
      }
    });

    return [active, misc];
  }

  _prepareSettlements() {
    return this.actor.system.settlements.map((settlement) => {
      const { defense, baseValue, ...modifiers } = settlement.modifiers;

      return {
        ...settlement,
        defense,
        baseValue,
        modifiers: Object.entries(modifiers).map(([key, value]) => ({
          label: game.i18n.localize(settlementModifiers[key]),
          value: value.total,
          kingdomValue: this.actor.system.modifiers?.[key].total,
        })),
        sizeLabel: game.i18n.localize(settlementSizes[settlement.size]),
        buildings: this.actor.itemTypes[kingdomBuildingId].filter(
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
      label: game.i18n.localize(optionalRules[key]),
      compendiumEntry: compendiumEntries[key],
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
    this.actor.system.rollKingdomStat(kingdomStat, { actor: this.actor });
  }

  async _onRollEventChance(event) {
    event.preventDefault();
    this.actor.system.rollEvent({ actor: this.actor });
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

    const buildingIdsToDelete = this.actor.itemTypes[kingdomBuildingId]
      .filter((building) => building.system.settlementId === settlementId)
      .map((building) => building._id);

    await this.actor.deleteEmbeddedDocuments("Item", buildingIdsToDelete);
  }

  async _onArmyCreate(event) {
    event.preventDefault();

    const newArmy = await Actor.create({
      name: game.i18n.localize("PF1KS.NewArmy"),
      type: kingdomArmyId,
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

  async _onItemDuplicate(event) {
    event.preventDefault();
    const itemId = event.currentTarget.closest(".item").dataset.id;
    const item = this.actor.items.get(itemId);

    const itemData = item.toObject();
    delete itemData._id;

    const searchUnusedName = (name) => {
      let iter = 1;
      let newName;
      do {
        iter += 1;
        newName = `${name} (${iter})`;
      } while (this.actor.items.getName(newName));
      return newName;
    };
    itemData.name = itemData.name.replace(/\s+\(\d+\)$/, "");
    itemData.name = searchUnusedName(itemData.name);

    const items = await this.actor.createEmbeddedDocuments("Item", [itemData]);
    items?.forEach((item) => item.sheet.render(true));
  }

  async _onItemEdit(event) {
    event.preventDefault();
    const itemId = event.currentTarget.closest(".item").dataset.id;
    const item = this.actor.items.get(itemId);

    item.sheet.render(true, { focus: true });
  }

  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;

    const type = header.dataset.type;
    const subType = header.dataset.subType;
    const typeName =
      (itemSubTypes[subType] ? `${game.i18n.localize(itemSubTypes[subType])} ` : "") +
      game.i18n.localize(CONFIG.Item.typeLabels[type] || type);

    const itemData = {
      name: game.i18n.format("PF1.NewItem", { type: typeName }),
      type,
      system: {},
    };

    if (type === kingdomBuildingId) {
      itemData.system.settlementId = header.dataset.settlementId;
    } else {
      itemData.system.subType = subType;
    }

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

  async _onOpenCompendiumEntry(event) {
    const uuid = event.currentTarget.dataset.compendiumEntry;

    const journal = await fromUuid(uuid);

    if (!journal) {
      return;
    }

    if (journal instanceof JournalEntryPage) {
      journal.parent.sheet.render(true, {
        pageId: journal.id,
        editable: false,
        collapsed: true,
        width: 600,
        height: 700,
      });
    } else {
      journal.sheet.render(true, { editable: false });
    }

    return journal;
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
