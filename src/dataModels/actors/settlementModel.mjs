import { DistrictModel } from "./districtModel.mjs";

export class SettlementModel extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields;

    return {
      id: new fields.StringField({ required: true, nullable: false, blank: false }),
      // img: new fields.FilePathField({ categories: ["IMAGE"] }), // TODO revisit for foundry v13 compatibility. See https://github.com/foundryvtt/foundryvtt/issues/11471
      name: new fields.StringField({ blank: true }),
      // TODO this is deprecated and will need to be removed eventually
      districtCount: new fields.NumberField({ integer: true, min: 0, initial: 1, nullable: false }),
      districts: new fields.ArrayField(new fields.EmbeddedDataField(DistrictModel)),
      magicItems: new fields.SchemaField({
        minor: new fields.ArrayField(new fields.StringField()),
        medium: new fields.ArrayField(new fields.StringField()),
        major: new fields.ArrayField(new fields.StringField()),
      }),
      attributes: new fields.SchemaField({
        // expanded settlement stuff
        government: new fields.StringField({
          initial: "aut",
          choices: Object.keys(pf1ks.config.settlementGovernments),
        }),
        alignment: new fields.StringField({ blank: true, choices: Object.keys(pf1.config.alignments) }),
      }),
    };
  }

  prepareDerivedData() {
    const kingdom = this.parent;
    const totalLots = this.parent.parent.itemTypes[pf1ks.config.buildingId]
      .filter((building) => building.system.settlementId === this.id && building.isAssigned && !building.error)
      .reduce((acc, curr) => acc + curr.system.lotSize, 0);
    const altSettlementMultiplier = totalLots > 40 ? this.districts.length : 1;

    // population
    this.attributes.population = totalLots * 250;

    // size
    if (kingdom.settings.optionalRules.altSettlementSizes) {
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
      if (this.attributes.population > 25000) {
        this.attributes.size = "metro";
      } else if (this.attributes.population > 10000) {
        this.attributes.size = "lcity";
      } else if (this.attributes.population > 5000) {
        this.attributes.size = "scity";
      } else if (this.attributes.population > 2000) {
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

    // the below is split between here and kingdomActor.mjs prepareDerivedData because of the change system.
    // size, alignment, and government are handled here and item changes and the totals are handled in kingdomActor.mjs

    // baseValue and defense
    this.attributes.baseValue = {};
    this.attributes.defense = {};

    // attribute size mod
    for (const attr of ["danger", "maxBaseValue", "purchaseLimit", "spellcasting"]) {
      this.attributes[attr] = {
        size: kingdom.settings.optionalRules.altSettlementSizes
          ? pf1ks.config.altSettlementValues[this.attributes.size][attr] * altSettlementMultiplier
          : pf1ks.config.settlementValues[this.attributes.size][attr],
      };
    }

    // spellcasting government
    this.attributes.spellcasting.government = kingdom.settings.optionalRules.expandedSettlementModifiers
      ? (pf1ks.config.settlementGovernmentBonuses[this.attributes.government]?.spellcasting ?? 0)
      : 0;

    // settlement modifiers
    this.modifiers = {};
    for (const modifier of Object.keys(pf1ks.config.settlementModifiers)) {
      const settlementValues = kingdom.settings.optionalRules.altSettlementSizes
        ? pf1ks.config.altSettlementValues[this.attributes.size]
        : pf1ks.config.settlementValues[this.attributes.size];
      const multiplier = kingdom.settings.optionalRules.altSettlementSizes ? altSettlementMultiplier : 1;
      const size = settlementValues.modifiers * multiplier;

      const kingdomAlignment = pf1ks.config.alignmentEffects[kingdom.alignment]?.[modifier] ?? 0;
      const kingdomGovernment = pf1ks.config.kingdomGovernmentBonuses[kingdom.government]?.[modifier] ?? 0;

      const settlementAlignment = kingdom.settings.optionalRules.expandedSettlementModifiers
        ? (pf1ks.config.alignmentEffects[this.attributes.alignment]?.[modifier] ?? 0)
        : 0;
      const settlementGovernment = kingdom.settings.optionalRules.expandedSettlementModifiers
        ? (pf1ks.config.settlementGovernmentBonuses[this.attributes.government]?.[modifier] ?? 0)
        : 0;

      this.modifiers[modifier] = {
        size,
        kingdomAlignment,
        kingdomGovernment,
        settlementAlignment,
        settlementGovernment,
      };
    }
  }
}
