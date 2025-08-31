import { DistrictModel } from "./districtModel.mjs";

export class SettlementModel extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields;

    return {
      id: new fields.StringField({ required: true, nullable: false, blank: false }),
      // img: new fields.FilePathField({ categories: ["IMAGE"] }), // TODO revisit for foundry v13 compatibility. See https://github.com/foundryvtt/foundryvtt/issues/11471
      name: new fields.StringField({ blank: true }),
      districts: new fields.ArrayField(new fields.EmbeddedDataField(DistrictModel)),
      magicItems: new fields.SchemaField({
        minor: new fields.ArrayField(new fields.StringField()),
        medium: new fields.ArrayField(new fields.StringField()),
        major: new fields.ArrayField(new fields.StringField()),
      }),
      // expanded settlement stuff
      government: new fields.StringField({ initial: "aut", choices: Object.keys(pf1ks.config.settlementGovernments) }),
      alignment: new fields.StringField({ blank: true, choices: Object.keys(pf1.config.alignments) }),
    };
  }

  static migrateData(data) {
    if (data.districtCount != null) {
      data.districts ??= [];
      for (let i = 0; i < data.districtCount; i++) {
        data.districts.push({
          name: game.i18n.format("PF1KS.NewDistrictLabel", { number: i + 1 }),
          id: foundry.utils.randomID(),
        });
      }
      delete data.districtCount;
    }
  }

  prepareDerivedData() {
    const kingdom = this.parent;
    const buildings = this.parent.parent.itemTypes[pf1ks.config.buildingId];
    const totalLots = buildings
      .filter((building) => building.system.settlementId === this.id)
      .reduce((acc, curr) => acc + curr.system.lots * curr.system.quantity, 0);
    const altSettlementMultiplier = totalLots > 40 ? this.districts.length : 1;

    // population
    this.population = totalLots * 250;

    // size
    if (kingdom.settings.optionalRules.altSettlementSizes) {
      if (totalLots > 100) {
        this.size = "metro";
      } else if (totalLots > 40) {
        this.size = "lcity";
      } else if (totalLots > 20) {
        this.size = "scity";
      } else if (totalLots > 8) {
        this.size = "ltown";
      } else if (totalLots > 1) {
        this.size = "stown";
      } else {
        this.size = "village";
      }
    } else {
      if (this.population > 25000) {
        this.size = "metro";
      } else if (this.population > 10000) {
        this.size = "lcity";
      } else if (this.population > 5000) {
        this.size = "scity";
      } else if (this.population > 2000) {
        this.size = "ltown";
      } else if (this.population > 200) {
        this.size = "stown";
      } else if (this.population > 60) {
        this.size = "village";
      } else if (this.population > 20) {
        this.size = "hamlet";
      } else {
        this.size = "thorpe";
      }
    }

    // danger
    this.danger = kingdom.settings.optionalRules.altSettlementSizes
      ? pf1ks.config.altSettlementValues[this.size].danger * altSettlementMultiplier
      : pf1ks.config.settlementValues[this.size].danger;

    // settlement modifiers
    // this is split between here and kingdomActor.mjs because of the change system.
    // size, alignment, and government are handled here and item changes and the totals are handled in kingdomActor.mjs
    this.modifiers = {};
    for (const modifier of Object.keys(pf1ks.config.allSettlementModifiers)) {
      let size = 0;
      // defense and baseValue dont have size params
      if (!["defense", "baseValue"].includes(modifier)) {
        const settlementValues = kingdom.settings.optionalRules.altSettlementSizes
          ? pf1ks.config.altSettlementValues[this.size]
          : pf1ks.config.settlementValues[this.size];
        const multiplier = kingdom.settings.optionalRules.altSettlementSizes ? altSettlementMultiplier : 1;
        if (["purchaseLimit", "spellcasting"].includes(modifier)) {
          size = settlementValues[modifier];
        } else {
          size = settlementValues.modifiers * multiplier;
        }
      }

      const kingdomAlignment = pf1ks.config.alignmentEffects[kingdom.alignment]?.[modifier] ?? 0;
      const kingdomGovernment = pf1ks.config.kingdomGovernmentBonuses[kingdom.government]?.[modifier] ?? 0;

      const settlementAlignment = kingdom.settings.optionalRules.expandedSettlementModifiers
        ? (pf1ks.config.alignmentEffects[this.alignment]?.[modifier] ?? 0)
        : 0;
      const settlementGovernment = kingdom.settings.optionalRules.expandedSettlementModifiers
        ? (pf1ks.config.settlementGovernmentBonuses[this.government]?.[modifier] ?? 0)
        : 0;

      if (
        !kingdom.settings.optionalRules.expandedSettlementModifiers &&
        ["purchaseLimit", "spellcasting"].includes(modifier)
      ) {
        this.modifiers[modifier] = {
          size: 0,
          kingdomAlignment: 0,
          kingdomGovernment: 0,
          settlementAlignment: 0,
          settlementGovernment: 0,
        };
      } else {
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
}
