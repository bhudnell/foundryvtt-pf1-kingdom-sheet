import {
  CFG,
  alignments,
  edicts,
  kingdomBuildingId,
  kingdomEventId,
  kingdomGovernments,
  kingdomImprovementId,
  kingdomStats,
} from "../config.mjs";

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
      edicts: [
        {
          id: "holiday",
          label: game.i18n.localize("PF1KS.Edicts.HolidayLabel"),
        },
        {
          id: "promotion",
          label: game.i18n.localize("PF1KS.Edicts.PromotionLabel"),
        },
        {
          id: "taxation",
          label: game.i18n.localize("PF1KS.Edicts.TaxationLabel"),
        },
      ],
      leaders: [
        {
          id: "ruler",
          label: game.i18n.localize("PF1RS.Leaders.Ruler"),
        },
        {
          id: "consort",
          label: game.i18n.localize("PF1RS.Leaders.Consort"),
        },
        {
          id: "heir",
          label: game.i18n.localize("PF1RS.Leaders.Heir"),
        },
        {
          id: "councilor",
          label: game.i18n.localize("PF1RS.Leaders.Councilor"),
        },
        {
          id: "general",
          label: game.i18n.localize("PF1RS.Leaders.General"),
        },
        {
          id: "diplomat",
          label: game.i18n.localize("PF1RS.Leaders.GrandDiplomat"),
        },
        {
          id: "priest",
          label: game.i18n.localize("PF1RS.Leaders.HighPriest"),
        },
        {
          id: "magister",
          label: game.i18n.localize("PF1RS.Leaders.Magister"),
        },
        {
          id: "marshal",
          label: game.i18n.localize("PF1RS.Leaders.Marshal"),
        },
        {
          id: "enforcer",
          label: game.i18n.localize("PF1RS.Leaders.RoyalEnforcer"),
        },
        {
          id: "spymaster",
          label: game.i18n.localize("PF1RS.Leaders.Spymaster"),
        },
        {
          id: "treasurer",
          label: game.i18n.localize("PF1RS.Leaders.Treasurer"),
        },
        {
          id: "warden",
          label: game.i18n.localize("PF1RS.Leaders.Warden"),
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

    // dropdowns
    data.alignmentOptions = Object.fromEntries(
      Object.entries(alignments).map(([key, label]) => [key, game.i18n.localize(label)])
    );
    data.governmentOptions = Object.fromEntries(
      Object.entries(kingdomGovernments).map(([key, label]) => [key, game.i18n.localize(label)])
    );

    // edicts
    for (const edict of data.edicts) {
      edict.options = Object.fromEntries(
        Object.entries(edicts[edict.id]).map(([key, label]) => [key, game.i18n.localize(label)])
      );
    }

    // kingdom stats
    for (const abl of data.stats) {
      abl.data = actorData[abl.id];
    }

    // non-viceroy leadership
    for (const leader of data.leaders) {
      leader.actorId = actorData.leadership[leader.id].actorId;
      leader.name = actorData.leadership[leader.id].name;
      leader.bonus = actorData.leadership[leader.id].bonus;
      leader.bonusType = actorData.leadership[leader.id].bonusTypes // TODO spymaster and ruler are dropdowns that can be changed
        .map((type) => game.i18n.localize(kingdomStats[type]))
        .join(", ");
    }
    // viceroys
    data.viceroys = actorData.leadership.viceroys.map((viceroy) => {
      return {
        id: viceroy.id,
        label: game.i18n.localize("PF1RS.Leaders.Viceroy"),
        actorId: viceroy.actorId,
        name: viceroy.name,
        bonus: viceroy.bonus,
        bonusType: viceroy.bonusTypes.map((type) => game.i18n.localize(kingdomStats[type])).join(", "),
      };
    });

    const leadershipChoices = { "": "" };
    game.actors
      .filter((actor) => actor.permission > 0 && (actor.type === "character" || actor.type === "npc"))
      .forEach((actor) => (leadershipChoices[actor.id] = actor.name));
    data.validLeadershipChoices = leadershipChoices;

    // settlements
    data.settlements = this._prepareSettlements();

    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);
  }

  async _prepareImprovements() {
    // TODO
    return [];
  }

  async _prepareEvents() {
    // TODO
    return [];
  }

  async _prepareSettlements() {
    // TODO
    return [];
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
