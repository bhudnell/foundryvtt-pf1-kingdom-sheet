import { ArmyProxyModel } from "./armyProxyModel.mjs";
import { defineLeader } from "./leaderModel.mjs";
import { SettlementModel } from "./settlementModel.mjs";

export class KingdomModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      government: new fields.StringField({ initial: "aut", choices: Object.keys(pf1ks.config.kingdomGovernments) }),
      alignment: new fields.StringField({ blank: true, choices: Object.keys(pf1.config.alignments) }),
      turn: new fields.NumberField({ integer: true, min: 0, initial: 0, nullable: false }),
      treasury: new fields.NumberField({ integer: true, initial: 0, nullable: false }),
      bpStorage: new fields.SchemaField({
        current: new fields.NumberField({ integer: true, min: 0, initial: 0, nullable: false }),
      }),
      unrest: new fields.NumberField({ integer: true, min: 0, initial: 0, nullable: false }),
      fame: new fields.SchemaField({
        base: new fields.NumberField({ integer: true, min: 0, initial: 0, nullable: false }),
      }),
      infamy: new fields.SchemaField({
        base: new fields.NumberField({ integer: true, min: 0, initial: 0, nullable: false }),
      }),
      edicts: new fields.SchemaField({
        holiday: new fields.StringField({ blank: true, choices: Object.keys(pf1ks.config.edicts.holiday) }),
        promotion: new fields.StringField({ blank: true, choices: Object.keys(pf1ks.config.edicts.promotion) }),
        taxation: new fields.StringField({ blank: true, choices: Object.keys(pf1ks.config.edicts.taxation) }),
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
        collapseTooltips: new fields.BooleanField({ initial: false }),
        optionalRules: new fields.SchemaField({
          kingdomModifiers: new fields.BooleanField({ initial: false }),
          fameInfamy: new fields.BooleanField({ initial: false }),
          governmentForms: new fields.BooleanField({ initial: false }),
          leadershipSkills: new fields.BooleanField({ initial: false }),
          altSettlementSizes: new fields.BooleanField({ initial: false }),
          expandedSettlementModifiers: new fields.BooleanField({ initial: false }),
        }),
      }),
    };
  }

  prepareBaseData() {
    for (const stat of [...Object.keys(pf1ks.config.kingdomStats), "consumption", "bonusBP", "fame", "infamy"]) {
      this[stat] ??= {};
      this[stat].total = 0;
    }

    this.bpStorage.max = 0;

    this.modifiers = {};
    for (const modifier of Object.keys(pf1ks.config.settlementModifiers)) {
      this.modifiers[modifier] = {
        settlementSize: 0,
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
    // delete armies whose actor has been deleted
    this.armies = this.armies.filter((army) => army.actor);

    // call settlements prepareDerivedData
    this.settlements.forEach((s) => s.prepareDerivedData());

    // summary
    this.size = Object.values(this.terrain).reduce((acc, curr) => acc + curr, 0);
    this.population = this.settlements.reduce((acc, curr) => acc + curr.attributes.population, 0);
    this.totalDistricts = this.settlements.reduce((acc, curr) => acc + curr.districts.length, 0);
    this.controlDC = 20 + this.size + this.totalDistricts;

    this.consumption.total += this.size + this.totalDistricts;

    this.fame.total = this.fame.base;
    this.infamy.total = this.infamy.base;

    // update ruler bonus type to option allowed by kingdom size
    if (this.size < 26) {
      if (!Object.keys(pf1ks.config.kingdomStats).includes(this.leadership.ruler.bonusType)) {
        this.leadership.ruler.bonusType = "economy";
      }
      if (
        this.settings.secondRuler &&
        !Object.keys(pf1ks.config.kingdomStats).includes(this.leadership.consort.bonusType)
      ) {
        this.leadership.consort.bonusType = "economy";
      }
    } else if (this.size < 101) {
      if (!Object.keys(pf1ks.config.leadershipBonusTwoStats).includes(this.leadership.ruler.bonusType)) {
        this.leadership.ruler.bonusType = "ecoLoy";
      }
      if (
        this.settings.secondRuler &&
        !Object.keys(pf1ks.config.leadershipBonusTwoStats).includes(this.leadership.consort.bonusType)
      ) {
        this.leadership.consort.bonusType = "ecoLoy";
      }
    } else {
      this.leadership.ruler.bonusType = "all";
      if (this.settings.secondRuler) {
        this.leadership.consort.bonusType = "all";
      }
    }
  }

  get skills() {
    return {};
  }
}
