import {
  alignmentEffects,
  alignments,
  CFG,
  edictEffects,
  edicts,
  governmentBonuses,
  kingdomBuildingId,
  kingdomEventId,
  kingdomGovernments,
  kingdomImprovementId,
  kingdomStats,
  leadershipBonusToKingdomStats,
  leadershipBonusTwoStats,
  leadershipPenalties,
  settlementModifiers,
} from "../../config/config.mjs";

import { ArmyProxyModel } from "./armyProxyModel.mjs";
import { defineLeader } from "./leaderModel.mjs";
import { SettlementModel } from "./settlementModel.mjs";

export class KingdomModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      government: new fields.StringField({ initial: "aut", choices: Object.keys(kingdomGovernments) }),
      alignment: new fields.StringField({ blank: true, choices: Object.keys(alignments) }),
      turn: new fields.NumberField({ integer: true, min: 0, initial: 0, nullable: false }),
      treasury: new fields.NumberField({ integer: true, initial: 0, nullable: false }),
      unrest: new fields.NumberField({ integer: true, min: 0, initial: 0, nullable: false }),
      fame: new fields.SchemaField({
        base: new fields.NumberField({ integer: true, min: 0, initial: 0, nullable: false }),
      }),
      infamy: new fields.SchemaField({
        base: new fields.NumberField({ integer: true, min: 0, initial: 0, nullable: false }),
      }),
      leadership: new fields.SchemaField({
        ruler: new fields.EmbeddedDataField(defineLeader("ruler", "", "kno")),
        consort: new fields.EmbeddedDataField(defineLeader("consort", "loyalty", "kno")),
        heir: new fields.EmbeddedDataField(defineLeader("heir", "loyalty", "kno")),
        councilor: new fields.EmbeddedDataField(defineLeader("councilor", "loyalty", "klo")),
        general: new fields.EmbeddedDataField(defineLeader("general", "stability", "sol")),
        diplomat: new fields.EmbeddedDataField(defineLeader("diplomat", "stability", "dip")),
        priest: new fields.EmbeddedDataField(defineLeader("priest", "stability", "kre")),
        magister: new fields.EmbeddedDataField(defineLeader("magister", "economy", "kar")),
        marshal: new fields.EmbeddedDataField(defineLeader("marshal", "economy", "sur")),
        enforcer: new fields.EmbeddedDataField(defineLeader("enforcer", "loyalty", "int")),
        spymaster: new fields.EmbeddedDataField(defineLeader("spymaster", "", "sen")),
        treasurer: new fields.EmbeddedDataField(defineLeader("treasurer", "economy", "mer")),
        warden: new fields.EmbeddedDataField(defineLeader("warden", "loyalty", "ken")),
        viceroys: new fields.ArrayField(new fields.EmbeddedDataField(defineLeader("viceroy", "economy", "kge"))),
      }),
      edicts: new fields.SchemaField({
        holiday: new fields.StringField({ blank: true, choices: Object.keys(edicts.holiday) }),
        promotion: new fields.StringField({ blank: true, choices: Object.keys(edicts.promotion) }),
        taxation: new fields.StringField({ blank: true, choices: Object.keys(edicts.taxation) }),
      }),
      settlements: new fields.ArrayField(new fields.EmbeddedDataField(SettlementModel)),
      terrain: new fields.SchemaField({
        cavern: new fields.NumberField({ integer: true, initial: 0, nullable: false }),
        coast: new fields.NumberField({ integer: true, initial: 0, nullable: false }),
        desert: new fields.NumberField({ integer: true, initial: 0, nullable: false }),
        forest: new fields.NumberField({ integer: true, initial: 0, nullable: false }),
        hills: new fields.NumberField({ integer: true, initial: 0, nullable: false }),
        jungle: new fields.NumberField({ integer: true, initial: 0, nullable: false }),
        marsh: new fields.NumberField({ integer: true, initial: 0, nullable: false }),
        mountains: new fields.NumberField({ integer: true, initial: 0, nullable: false }),
        plains: new fields.NumberField({ integer: true, initial: 0, nullable: false }),
        water: new fields.NumberField({ integer: true, initial: 0, nullable: false }),
      }),
      eventLastTurn: new fields.BooleanField(),
      armies: new fields.ArrayField(new fields.EmbeddedDataField(ArmyProxyModel)),
      notes: new fields.SchemaField({
        value: new fields.HTMLField({ required: false, blank: true }),
      }),
      settings: new fields.SchemaField({
        secondRuler: new fields.BooleanField({ initial: false }),
        optionalRules: new fields.SchemaField({
          kingdomModifiers: new fields.BooleanField({ initial: false }),
          fameInfamy: new fields.BooleanField({ initial: false }),
          governmentForms: new fields.BooleanField({ initial: false }),
          leadershipSkills: new fields.BooleanField({ initial: false }),
          altSettlementSizes: new fields.BooleanField({ initial: false }),
        }),
      }),
    };
  }

  prepareBaseData() {
    for (const stat of [...Object.keys(kingdomStats), "consumption", "bonusBP"]) {
      this[stat] = { total: 0 };
    }

    this.fame = {
      base: this.fame.base,
      lore: 0,
      society: 0,
      total: 0,
    };

    this.infamy = {
      base: this.infamy.base,
      corruption: 0,
      crime: 0,
      total: 0,
    };

    this.modifiers = {};
    for (const modifier of Object.keys(settlementModifiers)) {
      this.modifiers[modifier] = {
        settlementBase: 0,
        alignment: 0,
        government: 0,
        buildings: 0,
        improvements: 0,
        events: 0,
        total: 0,
      };
    }
  }

  prepareDerivedData() {
    // make sure armies are prepared before referencing them
    this._prepareArmies();

    // call settlements prepareDerivedData
    this.settlements.forEach((s) => s.prepareDerivedData());

    // summary
    this.size = Object.values(this.terrain).reduce((acc, curr) => acc + curr, 0);
    this.population =
      250 *
      this.parent.itemTypes[kingdomBuildingId]
        .filter((building) => building.system.settlementId)
        .reduce((acc, curr) => acc + curr.system.lots * curr.system.quantity, 0);
    this.totalDistricts = this.settlements.reduce((acc, curr) => acc + curr.districtCount, 0);
    this.controlDC = 20 + this.size + this.totalDistricts;

    this.fame.lore = Math.floor(this._getChanges("lore") / 10);
    this.fame.society = Math.floor(this._getChanges("society") / 10);
    this.fame.total = this.fame.lore + this.fame.society + this.fame.base;

    this.infamy.corruption = Math.floor(this._getChanges("corruption") / 10);
    this.infamy.crime = Math.floor(this._getChanges("crime") / 10);
    this.infamy.total = this.infamy.corruption + this.infamy.crime + this.infamy.base;

    // update ruler bonus type to option allowed by kingdom size
    if (this.size < 26) {
      if (!Object.keys(kingdomStats).includes(this.leadership.ruler.bonusType)) {
        this.leadership.ruler.bonusType = "economy";
      }
      if (this.settings.secondRuler && !Object.keys(kingdomStats).includes(this.leadership.consort.bonusType)) {
        this.leadership.consort.bonusType = "economy";
      }
    } else if (this.size < 101) {
      if (!Object.keys(leadershipBonusTwoStats).includes(this.leadership.ruler.bonusType)) {
        this.leadership.ruler.bonusType = "ecoLoy";
      }
      if (
        this.settings.secondRuler &&
        !Object.keys(leadershipBonusTwoStats).includes(this.leadership.consort.bonusType)
      ) {
        this.leadership.consort.bonusType = "ecoLoy";
      }
    } else {
      this.leadership.ruler.bonusType = "all";
      if (this.settings.secondRuler) {
        this.leadership.consort.bonusType = "all";
      }
    }

    if (this.settings.optionalRules.kingdomModifiers) {
      for (const modifier of Object.keys(settlementModifiers)) {
        const settlementBase = this.settlements.reduce((acc, curr) => acc + curr.modifiers[modifier].size, 0) / 10;
        const alignment = alignmentEffects[this.alignment]?.[modifier] ?? 0;
        const government = governmentBonuses[this.government]?.[modifier] ?? 0;
        const buildings = this._getChanges(modifier, kingdomBuildingId) / 10;
        const improvements = this._getChanges(modifier, kingdomImprovementId) / 10;
        const events = this._getChanges(modifier, kingdomEventId) / 10;
        const total = Math.floor(settlementBase + alignment + government + buildings + improvements + events);

        this.modifiers[modifier] = { settlementBase, alignment, government, buildings, improvements, events, total };
      }
    }
  }

  async rollKingdomStat(kingdomStatId, options = {}) {
    const parts = [];

    const changes = pf1.documents.actor.changes.getHighestChanges(
      this.changes.filter((c) => c.operator !== "set" && c.target === kingdomStatId && c.value),
      { ignoreTarget: true }
    );

    for (const c of changes) {
      parts.push(`${c.value * (c.parent.system.quantity ?? 1)}[${c.flavor}]`);
    }

    const label = game.i18n.localize(kingdomStats[kingdomStatId]);
    const actor = options.actor ?? this.actor;
    const token = options.token ?? this.token;

    const rollOptions = {
      ...options,
      parts,
      flavor: game.i18n.format("PF1KS.KingdomStatRoll", { check: label }),
      speaker: ChatMessage.getSpeaker({ actor, token, alias: token?.name }),
    };

    return await pf1.dice.d20Roll(rollOptions);
  }

  async rollEvent(options = {}) {
    const roll = new pf1.dice.RollPF("1d100");

    await roll.evaluate();

    const eventChance = this.eventLastTurn ? 25 : 75;

    const eventOccurred = roll.total <= eventChance;

    const actor = options.actor ?? this.actor;
    const token = options.token ?? this.token;

    const templateData = {
      label: game.i18n.format("PF1KS.EventChanceRoll", { chance: eventChance }),
      formula: roll.formula,
      natural: roll.total,
      bonus: 0,
      total: roll.total,
      tooltip: await roll.getTooltip(),
      eventOccurred,
    };

    const messageData = {
      type: CONST.CHAT_MESSAGE_TYPES.ROLL,
      sound: options.noSound ? undefined : CONFIG.sounds.dice,
      content: await renderTemplate(`modules/${CFG.id}/templates/chat/event-roll.hbs`, templateData),
      speaker: ChatMessage.getSpeaker({ actor, token, alias: token?.name }),
      flags: { [CFG.id]: { eventChanceCard: true } },
    };

    await ChatMessage.create(messageData);
  }

  _prepareArmies() {
    // armies
    this.armies = this.armies.filter((army) => army.actor);
    this.armies.forEach((army) => army.actor.prepareData());
  }

  _getChanges(target, type) {
    return this.parent.changes
      .filter((c) => {
        if (c.target !== target) {
          return false;
        }
        if (type && c.parent.type !== type) {
          return false;
        }
        return true;
      })
      .reduce((total, c) => total + c.value * (c.parent.system.quantity ?? 1), 0);
  }

  get skills() {
    return {};
  }
}
