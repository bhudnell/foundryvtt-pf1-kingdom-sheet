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
} from "../../config.mjs";

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
        marshal: new fields.EmbeddedDataField(defineLeader("marshal", "economy")),
        enforcer: new fields.EmbeddedDataField(defineLeader("enforcer", "loyalty")),
        spymaster: new fields.EmbeddedDataField(defineLeader("spymaster")),
        treasurer: new fields.EmbeddedDataField(defineLeader("treasurer", "economy")),
        warden: new fields.EmbeddedDataField(defineLeader("warden", "loyalty")),
        viceroys: new fields.ArrayField(new fields.EmbeddedDataField(defineLeader("viceroy", "economy"))),
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
      notes: new fields.HTMLField(),
    };
  }

  prepareBaseData() {
    for (const stat of Object.keys(kingdomStats)) {
      this[stat] = {
        alignment: 0,
        edicts: 0,
        leadership: 0,
        unrest: 0,
        buildings: 0,
        improvements: 0,
        events: 0,
        total: 0,
      };
    }

    this.controlDC = {
      base: 20,
      size: 0,
      districts: 0,
      total: 0,
    };

    this.consumption = {
      size: 0,
      districts: 0,
      edicts: 0,
      buildings: 0,
      improvements: 0,
      events: 0,
      total: 0,
    };

    this.fame = {
      base: this.fame.base,
      lore: 0,
      society: 0,
      buildings: 0,
      improvements: 0,
      events: 0,
      total: 0,
    };

    this.infamy = {
      base: this.infamy.base,
      corruption: 0,
      crime: 0,
      buildings: 0,
      improvements: 0,
      events: 0,
      total: 0,
    };
  }

  prepareDerivedData() {
    // call settlements prepareDerivedData
    this.settlements.forEach((s) => s.prepareDerivedData());

    // changes
    this.changes = this._prepareChanges();

    // summary
    this.size = Object.values(this.terrain).reduce((acc, curr) => acc + curr, 0);
    this.population = 250 * this.parent.itemTypes[kingdomBuildingId].reduce((acc, curr) => acc + curr.system.amount, 0);

    const districts = this.settlements.reduce((acc, curr) => acc + curr.districtCount, 0);

    this.controlDC.size = this.size;
    this.controlDC.districts = districts;
    this.controlDC.total = this.controlDC.base + this.controlDC.size + this.controlDC.districts;

    this.consumption.size = this.size;
    this.consumption.districts = districts;
    this.consumption.edicts =
      (edictEffects.holiday[this.edicts.holiday]?.consumption ?? 0) +
      (edictEffects.promotion[this.edicts.promotion]?.consumption ?? 0);
    this.consumption.buildings = this._getChanges("consumption", kingdomBuildingId);
    this.consumption.improvements = this._getChanges("consumption", kingdomImprovementId);
    this.consumption.events = this._getChanges("consumption", kingdomEventId);
    this.consumption.total =
      this.consumption.size +
      this.consumption.districts +
      this.consumption.edicts +
      this.consumption.improvements +
      this.consumption.buildings +
      this.consumption.events;

    this.fame.lore = Math.floor(this._getChanges("lore") / 10);
    this.fame.society = Math.floor(this._getChanges("society") / 10);
    this.fame.buildings = this._getChanges("fame", kingdomBuildingId);
    this.fame.improvements = this._getChanges("fame", kingdomImprovementId);
    this.fame.events = this._getChanges("fame", kingdomEventId);
    this.fame.total = this.fame.lore + this.fame.society + this.fame.base + this.fame.buildings + this.fame.events;

    this.infamy.corruption = Math.floor(this._getChanges("corruption") / 10);
    this.infamy.crime = Math.floor(this._getChanges("crime") / 10);
    this.infamy.buildings = this._getChanges("infamy", kingdomBuildingId);
    this.infamy.improvements = this._getChanges("infamy", kingdomImprovementId);
    this.infamy.events = this._getChanges("infamy", kingdomEventId);
    this.infamy.total =
      this.infamy.corruption + this.infamy.crime + this.infamy.base + this.infamy.buildings + this.infamy.events;

    // kingdom stats
    for (const stat of Object.keys(kingdomStats)) {
      // TODO can this be done cleaner?
      const filled = [];
      const vacant = [];
      for (const leader of Object.values(this.leadership).flatMap((v) => v)) {
        if (leader.vacant) {
          vacant.push(leader);
        } else {
          filled.push(leader);
        }
      }

      this[stat].buildings = this._getChanges(stat, kingdomBuildingId);
      this[stat].edicts =
        (edictEffects.holiday[this.edicts.holiday]?.[stat] ?? 0) +
        (edictEffects.promotion[this.edicts.promotion]?.[stat] ?? 0) +
        (edictEffects.taxation[this.edicts.taxation]?.[stat] ?? 0);
      this[stat].leadership =
        filled.reduce((acc, curr) => (curr.bonusTypes.includes(stat) ? curr.bonus : 0) + acc, 0) -
        vacant.reduce((acc, curr) => (leadershipPenalties[curr.type][stat] ?? 0) + acc, 0);
      this[stat].alignment = alignmentEffects[this.alignment]?.[stat] ?? 0;
      this[stat].unrest = this.unrest;
      this[stat].improvements = this._getChanges(stat, kingdomImprovementId);
      this[stat].events = this._getChanges(stat, kingdomEventId);
      this[stat].total =
        this[stat].buildings +
        this[stat].edicts +
        this[stat].leadership +
        this[stat].alignment +
        this[stat].improvements +
        this[stat].events -
        this[stat].unrest;
    }
  }

  _prepareChanges() {
    const changeItems = this.parent.items.filter((item) => item.system.changes?.length > 0);

    const changes = [];
    for (const i of changeItems) {
      changes.push(
        ...i.system.changes.map((c) => ({
          ...c,
          id: c.id,
          parentId: i.id,
          parentName: i.name,
          parentType: i.type,
          parentAmount: i.system.amount,
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

  _getChanges(target, type) {
    return this.changes
      .filter((c) => {
        if (c.target !== target) {
          return false;
        }
        if (type && c.parentType !== type) {
          return false;
        }
        return true;
      })
      .reduce((total, c) => total + c.bonus * (c.parentAmount ?? 1), 0);
  }
}
