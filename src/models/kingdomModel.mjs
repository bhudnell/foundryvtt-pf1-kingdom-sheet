import { alignments, edicts, kingdomGovernments } from "../config.mjs";

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
        consort: new fields.EmbeddedDataField(defineLeader("consort")),
        heir: new fields.EmbeddedDataField(defineLeader("heir")),
        general: new fields.EmbeddedDataField(defineLeader("general")),
        diplomat: new fields.EmbeddedDataField(defineLeader("diplomat")),
        priest: new fields.EmbeddedDataField(defineLeader("priest")),
        magister: new fields.EmbeddedDataField(defineLeader("magister")),
        marshall: new fields.EmbeddedDataField(defineLeader("marshall")),
        enforcer: new fields.EmbeddedDataField(defineLeader("enforcer")),
        spymaster: new fields.EmbeddedDataField(defineLeader("spymaster")),
        treasurer: new fields.EmbeddedDataField(defineLeader("treasurer")),
        warden: new fields.EmbeddedDataField(defineLeader("warden")),
        viceroys: new fields.ArrayField(new fields.EmbeddedDataField(defineLeader("viceroy")), { initial: [] }),
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
      government: 0,
      skill: 0,
      other: 0,
      total: 0,
    };
    this.loyalty = {
      buildings: 0,
      edicts: 0,
      leadership: 0,
      alignment: 0,
      unrest: 0,
      improvements: 0,
      government: 0,
      skill: 0,
      other: 0,
      total: 0,
    };
    this.stability = {
      buildings: 0,
      edicts: 0,
      leadership: 0,
      alignment: 0,
      unrest: 0,
      improvements: 0,
      government: 0,
      skill: 0,
      other: 0,
      total: 0,
    };

    this.controlDC = {
      base: 20,
      size: 0,
      districts: 0,
      other: 0,
      total: 0,
    };

    this.consumption = {
      size: 0,
      districts: 0,
      improvements: 0,
      edicts: 0,
      buildings: 0,
      other: 0,
      total: 0,
    };

    this.fame = {
      lore: 0,
      society: 0,
      buildings: 0,
      other: 0,
      total: 0,
    };

    this.infamy = {
      corruption: 0,
      crime: 0,
      buildings: 0,
      other: 0,
      total: 0,
    };
  }

  prepareDerivedData() {
    // TODO all these
    this.size = 0;
    this.population = 0;

    // See above for these
    this.controlDC = 0;
    this.consumption = 0;
    this.fame = 0;
    this.infamy = 0;
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

  _getChanges(ability) {
    const abilityArr = Array.isArray(ability) ? ability : [ability];
    return this.changes.filter((c) => abilityArr.includes(c.ability)).reduce((total, c) => total + c.bonus, 0);
  }
}
