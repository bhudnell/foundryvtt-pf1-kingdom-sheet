import {
  altSettlementValues,
  governmentBonuses,
  kingdomBuildingId,
  kingdomEventId,
  kingdomImprovementId,
  allSettlementModifiers,
  settlementValues,
} from "../../config.mjs";

export class SettlementModel extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields;

    return {
      id: new fields.StringField({ required: true, nullable: false, blank: false }),
      name: new fields.StringField({ blank: true }),
      districtCount: new fields.NumberField({ integer: true, min: 0, initial: 1, nullable: false }),
    };
  }

  prepareDerivedData() {
    const kingdom = this.parent;
    const buildings = this.parent.parent.itemTypes[kingdomBuildingId];
    const totalLots = buildings
      .filter((building) => building.system.settlementId === this.id)
      .reduce((acc, curr) => acc + curr.system.lots * curr.system.amount, 0);
    const altSettlementMultiplier = totalLots > 40 ? this.districtCount : 1;

    // population
    this.population = totalLots * 250;

    // size
    if (kingdom.config.altSettlementSizes) {
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
    this.danger = kingdom.config.altSettlementSizes
      ? altSettlementValues[this.size].danger * altSettlementMultiplier
      : settlementValues[this.size].danger;

    // settlement modifiers
    for (const modifier of Object.keys(allSettlementModifiers)) {
      const size = ["defense", "baseValue"].includes(modifier)
        ? 0
        : kingdom.config.altSettlementSizes
          ? altSettlementValues[this.size].modifiers * altSettlementMultiplier
          : settlementValues[this.size].modifiers;
      const government = governmentBonuses[kingdom.government]?.[modifier] ?? 0;
      const buildings = this._getChanges(modifier, kingdomBuildingId);
      const improvements = this._getChanges(modifier, kingdomImprovementId);
      const events = this._getChanges(modifier, kingdomEventId);

      let total = size + government + buildings + improvements + events;

      if (modifier === "baseValue") {
        total = Math.min(
          total,
          kingdom.config.altSettlementSizes
            ? altSettlementValues[this.size].maxBaseValue
            : settlementValues[this.size].maxBaseValue
        );
      }

      this[modifier] = { size, government, buildings, improvements, events, total };
    }
  }

  _getChanges(target, type) {
    return this.parent.changes
      .filter((c) => {
        if (c.scope !== "kingdom" && c.settlementId !== this.id) {
          return false;
        }
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
