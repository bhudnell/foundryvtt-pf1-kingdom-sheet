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
      template: `modules/${CFG.id}/templates/actors/kingdom-sheet.hbs`,
      classes: [...options.classes, "kingdom", "actor"],
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
      leaders: [
        {
          id: "ruler",
          label: game.i18n.localize("PF1KS.Leadership.Ruler"),
        },
        {
          id: "consort",
          label: game.i18n.localize("PF1KS.Leadership.Consort"),
        },
        {
          id: "heir",
          label: game.i18n.localize("PF1KS.Leadership.Heir"),
        },
        {
          id: "councilor",
          label: game.i18n.localize("PF1KS.Leadership.Councilor"),
        },
        {
          id: "general",
          label: game.i18n.localize("PF1KS.Leadership.General"),
        },
        {
          id: "diplomat",
          label: game.i18n.localize("PF1KS.Leadership.GrandDiplomat"),
        },
        {
          id: "priest",
          label: game.i18n.localize("PF1KS.Leadership.HighPriest"),
        },
        {
          id: "magister",
          label: game.i18n.localize("PF1KS.Leadership.Magister"),
        },
        {
          id: "marshal",
          label: game.i18n.localize("PF1KS.Leadership.Marshal"),
        },
        {
          id: "enforcer",
          label: game.i18n.localize("PF1KS.Leadership.RoyalEnforcer"),
        },
        {
          id: "spymaster",
          label: game.i18n.localize("PF1KS.Leadership.Spymaster"),
        },
        {
          id: "treasurer",
          label: game.i18n.localize("PF1KS.Leadership.Treasurer"),
        },
        {
          id: "warden",
          label: game.i18n.localize("PF1KS.Leadership.Warden"),
        },
      ],
    };

    // item types
    data.improvementSections = this._prepareImprovements();
    data.improvementType = kingdomImprovementId;
    data.eventSections = this._prepareEvents();
    data.eventType = kingdomEventId;
    data.buildingType = kingdomBuildingId;

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
      acc.push({ value: actorData[key], label: game.i18n.localize(value) });
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

    // non-viceroy leadership
    for (const leader of data.leaders) {
      leader.actorId = actorData.leadership[leader.id].actorId;
      leader.bonus = actorData.leadership[leader.id].bonus;
      leader.bonusTypesLabel = actorData.leadership[leader.id].bonusTypes // TODO spymaster and ruler are dropdowns that can be changed
        .map((type) => game.i18n.localize(kingdomStats[type]))
        .join(", ");
      leader.skillBonus = actorData.leadership[leader.id].skillBonus;
      leader.skillBonusLabel = game.i18n.localize(
        leadershipSkillBonuses[actorData.leadership[leader.id].skillBonusType]
      );
    }
    // viceroys
    data.viceroys = actorData.leadership.viceroys.map((viceroy) => {
      return {
        id: viceroy.id,
        label: game.i18n.localize("PF1KS.Leadership.Viceroy"),
        actorId: viceroy.actorId,
        bonus: viceroy.bonus,
        bonusTypesLabel: viceroy.bonusTypes.map((type) => game.i18n.localize(kingdomStats[type])).join(", "),
        skillBonus: viceroy.skillBonus,
        skillBonusLabel: game.i18n.localize(leadershipSkillBonuses[viceroy.skillBonusType]),
      };
    });

    const leadershipChoices = { "": "" };
    game.actors
      .filter((actor) => actor.permission > 0 && (actor.type === "character" || actor.type === "npc"))
      .forEach((actor) => (leadershipChoices[actor.id] = actor.name));
    data.validLeadershipChoices = leadershipChoices;

    // settlements
    data.settlements = this._prepareSettlements();
    data.noSettlementBuildings = this.actor.itemTypes[kingdomBuildingId].filter(
      (building) => !actorData.settlements.map((s) => s.id).includes(building.system.settlementId)
    );

    // terrain
    data.terrain = Object.entries(actorData.terrain).reduce((acc, [key, value]) => {
      acc[key] = { value, label: game.i18n.localize(terrainTypes[key]) };
      return acc;
    }, {});

    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find(".government-toggle").on("change", (e) => this._onGovernmentChange(e));

    html.find(".kingdom-stat .rollable").on("click", (e) => this._onRollKingdomStat(e));

    html.find(".viceroy-create").on("click", (e) => this._onViceroyCreate(e));
    html.find(".viceroy-delete").on("click", (e) => this._onViceroyDelete(e));

    html.find(".settlement-create").on("click", (e) => this._onSettlementCreate(e));
    html.find(".settlement-delete").on("click", (e) => this._onSettlementDelete(e));

    html.find(".item-delete").on("click", (e) => this._onItemDelete(e));
    html.find(".item-edit").on("click", (e) => this._onItemEdit(e));
    html.find(".item-create").on("click", (e) => this._onItemCreate(e));
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
    const settlements = [];
    for (const settlement of this.actor.system.settlements) {
      settlements.push({
        ...settlement,
        sizeLabel: game.i18n.localize(settlementSizes[settlement.size]),
        buildings: this.actor.itemTypes[kingdomBuildingId].filter(
          (building) => building.system.settlementId === settlement.id
        ),
      });
    }
    return settlements;
  }

  _onGovernmentChange(event) {
    if (!event.target.checked) {
      this.actor.update({ "system.government": "aut" });
    }
  }

  async _onRollKingdomStat(event) {
    event.preventDefault();
    const kingdomStat = event.currentTarget.closest(".kingdom-stat").dataset.kingdomStat;
    this.actor.system.rollKingdomStat(kingdomStat, { actor: this.actor, skipDialog: true });
  }

  async _onViceroyCreate(event) {
    event.preventDefault();

    const viceroys = foundry.utils.duplicate(this.actor.system.leadership.viceroys ?? []);
    viceroys.push({
      type: "viceroy",
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

    const settlements = foundry.utils.duplicate(this.actor.system.settlements ?? []);
    settlements.push({
      name: game.i18n.localize("PF1KS.NewSettlement"),
      id: foundry.utils.randomID(),
      districtCount: 1,
    });

    await this._onSubmit(event, {
      updateData: { "system.settlements": settlements },
    });
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
    const subType = header.dataset.subType;
    const typeName =
      (itemSubTypes[subType] ? `${game.i18n.localize(itemSubTypes[subType])} ` : "") +
      game.i18n.localize(CONFIG.Item.typeLabels[type] || type);

    const itemData = {
      name: game.i18n.format("PF1.NewItem", { type: typeName }),
      type,
      system: { subType },
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

    const text = await renderTemplate(`modules/${CFG.id}/templates/actors/parts/tooltip-content.hbs`, templateData);

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
