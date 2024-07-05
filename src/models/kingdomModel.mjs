import {
  alignmentEffects,
  alignments,
  edictEffects,
  edicts,
  kingdomBuildingId,
  kingdomEventId,
  kingdomGovernments,
  kingdomImprovementId,
  kingdomStats,
  leadershipPenalties,
} from "../config.mjs";

import { defineLeader } from "./leaderModel.mjs";
import { SettlementModel } from "./settlementModel.mjs";

export class KingdomModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      government: new fields.StringField({ blank: true, choices: Object.keys(kingdomGovernments) }),
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
        ruler: new fields.EmbeddedDataField(defineLeader("ruler")),
        consort: new fields.EmbeddedDataField(defineLeader("consort", "loyalty")),
        heir: new fields.EmbeddedDataField(defineLeader("heir", "loyalty")),
        councilor: new fields.EmbeddedDataField(defineLeader("councilor", "loyalty")),
        general: new fields.EmbeddedDataField(defineLeader("general", "stability")),
        diplomat: new fields.EmbeddedDataField(defineLeader("diplomat", "stability")),
        priest: new fields.EmbeddedDataField(defineLeader("priest", "stability")),
        magister: new fields.EmbeddedDataField(defineLeader("magister", "economy")),
        marshall: new fields.EmbeddedDataField(defineLeader("marshall", "economy")),
        enforcer: new fields.EmbeddedDataField(defineLeader("enforcer", "loyalty")),
        spymaster: new fields.EmbeddedDataField(defineLeader("spymaster")),
        treasurer: new fields.EmbeddedDataField(defineLeader("treasurer", "economy")),
        warden: new fields.EmbeddedDataField(defineLeader("warden", "loyalty")),
        viceroys: new fields.ArrayField(new fields.EmbeddedDataField(defineLeader("viceroy", "economy")), {
          initial: [],
        }),
      }),
      edicts: new fields.SchemaField({
        holiday: new fields.StringField({ blank: true, choices: Object.keys(edicts.holiday) }),
        promotion: new fields.StringField({ blank: true, choices: Object.keys(edicts.promotion) }),
        taxation: new fields.StringField({ blank: true, choices: Object.keys(edicts.taxation) }),
      }),
      settlements: new fields.ArrayField(new fields.EmbeddedDataField(SettlementModel), { initial: [] }),
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
      notes: new fields.HTMLField(),
    };
  }

  prepareBaseData() {
    this.economy = {
      buildings: 0,
      edicts: 0,
      leadership: 0,
      alignment: 0,
      unrest: 0,
      improvements: 0,
      events: 0,
      total: 0,
    };
    this.loyalty = {
      buildings: 0,
      edicts: 0,
      leadership: 0,
      alignment: 0,
      unrest: 0,
      improvements: 0,
      events: 0,
      total: 0,
    };
    this.stability = {
      buildings: 0,
      edicts: 0,
      leadership: 0,
      alignment: 0,
      unrest: 0,
      improvements: 0,
      events: 0,
      total: 0,
    };

    this.controlDC = {
      base: 20,
      size: 0,
      districts: 0,
      total: 0,
    };

    this.consumption = {
      size: 0,
      districts: 0,
      improvements: 0,
      edicts: 0,
      buildings: 0,
      total: 0,
    };

    this.fame = {
      lore: 0,
      society: 0,
      buildings: 0,
      events: 0,
      total: 0,
    };

    this.infamy = {
      corruption: 0,
      crime: 0,
      buildings: 0,
      events: 0,
      total: 0,
    };
  }

  prepareDerivedData() {
    // changes
    this.changes = this._prepareChanges();

    // summary
    this.size = Object.values(this.terrain).reduce((accum, curr) => accum + curr, 0);
    this.population =
      250 * this.parent.itemTypes[kingdomBuildingId].reduce((accum, curr) => accum + curr.system.quantity, 0);

    const districts = this.settlements.reduce((accum, curr) => accum + curr.districtCount, 0);

    this.controlDC.size = this.size;
    this.controlDC.districts = districts;
    this.controlDC.total = this.controlDC.base + this.controlDC.size + this.controlDC.districts;

    this.consumption.size = this.size;
    this.consumption.districts = districts;
    this.consumption.improvements = this._getChanges("consumption", kingdomImprovementId);
    this.consumption.edicts =
      edictEffects.holiday[this.edicts.holiday].consumption + edictEffects.promotion[this.edicts.promotion].consumption;
    this.consumption.buildings = this._getChanges("consumption", kingdomBuildingId);
    this.consumption.total =
      this.consumption.size +
      this.consumption.districts +
      this.consumption.improvements +
      this.consumption.edicts +
      this.consumption.buildings;

    this.fame.lore = Math.floor(this._getChanges("lore") / 10);
    this.fame.society = Math.floor(this._getChanges("society") / 10);
    this.fame.buildings = this._getChanges("fame", kingdomBuildingId);
    this.fame.events = this._getChanges("fame", kingdomEventId);
    this.fame.total = this.fame.lore + this.fame.society + this.fame.base + this.fame.buildings + this.fame.events;

    this.infamy.corruption = Math.floor(this._getChanges("corruption") / 10);
    this.infamy.crime = Math.floor(this._getChanges("crime") / 10);
    this.infamy.buildings = this._getChanges("infamy", kingdomBuildingId);
    this.infamy.events = this._getChanges("infamy", kingdomEventId);
    this.infamy.total =
      this.infamy.corruption + this.infamy.crime + this.infamy.base + this.infamy.buildings + this.infamy.events;

    // kingdom stats
    for (const stat of Object.keys(kingdomStats)) {
      // TODO can this be done cleaner?
      const filled = [];
      const vacant = [];
      for (const [key, value] of Object.entries(this.leadership)) {
        if (value.vacant) {
          vacant.push(key);
        } else {
          filled.push(key);
        }
      }

      this[stat].buildings = this._getChanges(stat, kingdomBuildingId);
      this[stat].edicts =
        edictEffects.holiday[this.edicts.holiday][stat] +
        edictEffects.promotion[this.edicts.promotion][stat] +
        edictEffects.taxation[this.edicts.taxation][stat];
      this[stat].leadership =
        filled.reduce((curr, accum) => (curr.bonusTypes.includes(stat) ? curr.bonus : 0) + accum, 0) -
        vacant.reduce((curr, accum) => (leadershipPenalties[curr.type][stat] ?? 0) + accum, 0);
      this[stat].alignment = alignmentEffects[this.alignment][stat];
      this[stat].unrest = this.unrest;
      this[stat].improvements = this._getChanges(stat, kingdomImprovementId);
      this[stat].events = this._getChanges(stat, kingdomEventId);
      this[stat].total =
        this[stat].buildings +
        this[stat].edicts +
        this[stat].leadership +
        this[stat].alignment +
        this[stat].unrest +
        this[stat].improvements +
        this[stat].skill +
        this[stat].events;
    }
  }

  _prepareChanges() {
    const changeItems = this.parent.items.filter((item) => item.system.changes?.length > 0);

    const changes = [];
    for (const i of changeItems) {
      changes.push(
        ...i.system.changes.map((c) => ({
          ...c,
          parentId: i.id,
          parentName: i.name,
          parentType: i.type,
        }))
      );
    }

    const c = new Collection();
    for (const change of changes) {
      // Avoid ID conflicts
      const parentId = change.parentId ?? "Actor";
      const uniqueId = `${parentId}-${change.id}`;
      c.set(uniqueId, change);
    }
    return c;
  }

  _getChanges(ability, type) {
    return this.changes
      .filter((c) => {
        if (c.ability !== ability) {
          return false;
        }
        if (type && c.parentType !== type) {
          return false;
        }
        return true;
      })
      .reduce((total, c) => total + c.bonus, 0);
  }
}
