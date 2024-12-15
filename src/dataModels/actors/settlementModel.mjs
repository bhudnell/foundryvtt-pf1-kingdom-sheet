export class SettlementModel extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields;

    return {
      id: new fields.StringField({ required: true, nullable: false, blank: false }),
      // img: new fields.FilePathField({ categories: ["IMAGE"] }), // TODO revisit for foundry v13 compatibility. See https://github.com/foundryvtt/foundryvtt/issues/11471
      name: new fields.StringField({ blank: true }),
      districtCount: new fields.NumberField({ integer: true, min: 0, initial: 1, nullable: false }),
    };
  }

  prepareDerivedData() {
    const kingdom = this.parent;
    const buildings = this.parent.parent.itemTypes[pf1ks.config.buildingId];
    const totalLots = buildings
      .filter((building) => building.system.settlementId === this.id)
      .reduce((acc, curr) => acc + curr.system.lots * curr.system.quantity, 0);
    const altSettlementMultiplier = totalLots > 40 ? this.districtCount : 1;

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
      const size = ["defense", "baseValue"].includes(modifier)
        ? 0
        : kingdom.settings.optionalRules.altSettlementSizes
          ? pf1ks.config.altSettlementValues[this.size].modifiers * altSettlementMultiplier
          : pf1ks.config.settlementValues[this.size].modifiers;
      const alignment = pf1ks.config.alignmentEffects[kingdom.alignment]?.[modifier] ?? 0;
      const government = pf1ks.config.governmentBonuses[kingdom.government]?.[modifier] ?? 0;

      this.modifiers[modifier] = {
        size,
        alignment,
        government,
      };
    }
  }
}
