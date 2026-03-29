import { ActorProxyModel } from "./actorProxyModel.mjs";
import { DistrictModel } from "./districtModel.mjs";

export class SettlementModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;

    return {
      districts: new fields.ArrayField(new fields.EmbeddedDataField(DistrictModel)),
      magicItems: new fields.SchemaField({
        minor: new fields.SchemaField({
          items: new fields.ArrayField(new fields.StringField()),
        }),
        medium: new fields.SchemaField({
          items: new fields.ArrayField(new fields.StringField()),
        }),
        major: new fields.SchemaField({
          items: new fields.ArrayField(new fields.StringField()),
        }),
      }),
      attributes: new fields.SchemaField({
        // expanded settlement stuff
        government: new fields.StringField({
          initial: "aut",
          choices: Object.keys(pf1ks.config.settlementGovernments),
        }),
        alignment: new fields.StringField({ blank: true, choices: Object.keys(pf1.config.alignments) }),
      }),

      settings: new fields.SchemaField({
        collapseTooltips: new fields.BooleanField({ initial: false }),
        optionalRules: new fields.SchemaField({
          altSettlementSizes: new fields.BooleanField({ initial: false }),
          expandedSettlementModifiers: new fields.BooleanField({ initial: false }),
        }),
      }),

      kingdom: new fields.EmbeddedDataField(ActorProxyModel, { nullable: true, required: false }),

      notes: new fields.SchemaField({
        value: new fields.HTMLField({ required: false, blank: true }),
      }),
    };
  }

  prepareBaseData() {
    this.attributes.population = 0;
    this.attributes.size = "";

    for (const attr of Object.keys(pf1ks.config.settlementAttributes)) {
      this.attributes[attr] = {
        total: 0,
      };

      if (["danger", "maxBaseValue", "purchaseLimit", "spellcasting"].includes(attr)) {
        this.attributes[attr].size = 0;
      }

      if (["maxBaseValue", "purchaseLimit"].includes(attr)) {
        this.attributes[attr].increase = 0;
      }

      if (attr === "spellcasting") {
        this.attributes[attr].government = 0;
      }
    }

    // settlement modifiers
    this.modifiers = {};
    for (const modifier of Object.keys(pf1ks.config.settlementModifiers)) {
      this.modifiers[modifier] = {
        size: 0,
        alignment: 0,
        government: 0,
        kingdomAlignment: 0,
        kingdomGovernment: 0,
        settlementTotal: 0,
        total: 0,
      };
    }

    // magic items
    this.magicItems.minor.max = 0;
    this.magicItems.medium.max = 0;
    this.magicItems.major.max = 0;

    // data that needs to be held for kingdoms, but not really used by the settlement
    this.kingdomStats = { bpStorage: 0, economy: 0, loyalty: 0, stability: 0, fame: 0, infamy: 0 };
  }

  prepareDerivedData() {
    const totalLots = this.parent.itemTypes[pf1ks.config.buildingId]
      .filter((building) => building.isAssigned && !building.error)
      .reduce((acc, curr) => acc + curr.system.lotSize, 0);
    const altSettlementMultiplier = totalLots > 40 ? this.districts.length : 1;

    // population
    this.attributes.population = totalLots * 250;

    // size
    if (this.settings.optionalRules.altSettlementSizes) {
      if (totalLots > 100) {
        this.attributes.size = "metro";
      } else if (totalLots > 40) {
        this.attributes.size = "lcity";
      } else if (totalLots > 20) {
        this.attributes.size = "scity";
      } else if (totalLots > 8) {
        this.attributes.size = "ltown";
      } else if (totalLots > 1) {
        this.attributes.size = "stown";
      } else {
        this.attributes.size = "village";
      }
    } else {
      if (this.attributes.population > 25_000) {
        this.attributes.size = "metro";
      } else if (this.attributes.population > 10_000) {
        this.attributes.size = "lcity";
      } else if (this.attributes.population > 5_000) {
        this.attributes.size = "scity";
      } else if (this.attributes.population > 2_000) {
        this.attributes.size = "ltown";
      } else if (this.attributes.population > 200) {
        this.attributes.size = "stown";
      } else if (this.attributes.population > 60) {
        this.attributes.size = "village";
      } else if (this.attributes.population > 20) {
        this.attributes.size = "hamlet";
      } else {
        this.attributes.size = "thorpe";
      }
    }

    // settlement attributes
    for (const attr of Object.keys(pf1ks.config.settlementAttributes)) {
      // attribute size mod
      if (["danger", "maxBaseValue", "purchaseLimit", "spellcasting"].includes(attr)) {
        this.attributes[attr].size = this.settings.optionalRules.altSettlementSizes
          ? pf1ks.config.altSettlementValues[this.attributes.size][attr] * altSettlementMultiplier
          : pf1ks.config.settlementValues[this.attributes.size][attr];
      }

      // spellcasting government
      if (attr === "spellcasting") {
        this.attributes.spellcasting.government = this.settings.optionalRules.expandedSettlementModifiers
          ? (pf1ks.config.settlementGovernmentBonuses[this.attributes.government]?.spellcasting ?? 0)
          : 0;
      }

      // total
      this.attributes[attr].total = Object.entries(this.attributes[attr])
        .filter(([k, v]) => k !== "total" && typeof v === "number")
        .reduce((acc, [, v]) => acc + v, 0);
    }

    // settlement modifiers
    for (const modifier of Object.keys(pf1ks.config.settlementModifiers)) {
      const settlementValues = this.settings.optionalRules.altSettlementSizes
        ? pf1ks.config.altSettlementValues[this.attributes.size]
        : pf1ks.config.settlementValues[this.attributes.size];
      const multiplier = this.settings.optionalRules.altSettlementSizes ? altSettlementMultiplier : 1;
      const size = settlementValues.modifiers * multiplier;

      const kingdomAlignment = pf1ks.config.alignmentEffects[this.kingdom?.actor?.system.alignment]?.[modifier] ?? 0;
      const kingdomGovernment =
        pf1ks.config.kingdomGovernmentBonuses[this.kingdom?.actor?.system.government]?.[modifier] ?? 0;

      const alignment = this.settings.optionalRules.expandedSettlementModifiers
        ? (pf1ks.config.alignmentEffects[this.attributes.alignment]?.[modifier] ?? 0)
        : 0;
      const government = this.settings.optionalRules.expandedSettlementModifiers
        ? (pf1ks.config.settlementGovernmentBonuses[this.attributes.government]?.[modifier] ?? 0)
        : 0;

      const settlementTotal = size + alignment + government + kingdomAlignment + kingdomGovernment;

      this.modifiers[modifier] = {
        size,
        alignment,
        government,
        kingdomAlignment,
        kingdomGovernment,
        settlementTotal,
        total: settlementTotal,
      };
    }
  }
}
