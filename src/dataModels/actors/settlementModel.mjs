export class SettlementModel extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields;

    return {
      id: new fields.StringField({ required: true, nullable: false, blank: false }),
      // img: new fields.FilePathField({ categories: ["IMAGE"] }), // TODO revisit if foundry ever allows filePathFields within ArrayFields. See https://github.com/foundryvtt/foundryvtt/issues/11471
      name: new fields.StringField({ blank: true }),
      districtCount: new fields.NumberField({ integer: true, min: 0, initial: 1, nullable: false }),
    };
  }

  prepareDerivedData() {
    const kingdom = this.parent;
    const buildings = this.parent.parent.itemTypes[pf1ks.config.kingdomBuildingId];
    const totalLots = buildings
      .filter((building) => building.system.settlementId === this.id)
      .reduce((acc, curr) => acc + curr.system.lots * curr.system.quantity, 0);

    // population
    this.population = totalLots * 250;

    // size
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

    // danger
    this.danger = pf1ks.config.settlementValues[this.size].danger;

    // settlement modifiers
    this.modifiers = {};
    for (const modifier of Object.keys(pf1ks.config.allSettlementModifiers)) {
      const size = ["defense", "baseValue"].includes(modifier) ? 0 : pf1ks.config.settlementValues[this.size].modifiers;
      const government = pf1ks.config.governmentBonuses[kingdom.government]?.[modifier] ?? 0;
      const buildings = this._getChanges(modifier, pf1ks.config.kingdomBuildingId);
      const improvements = this._getChanges(modifier, pf1ks.config.kingdomImprovementId);
      const events = this._getChanges(modifier, pf1ks.config.kingdomEventId);

      let total = size + government + buildings + improvements + events;

      if (modifier === "baseValue") {
        total = Math.min(total, pf1ks.config.settlementValues[this.size].maxBaseValue);
      }

      this.modifiers[modifier] = { size, government, buildings, improvements, events, total };
    }

    // alt settlement sizes optional rule
    if (kingdom.settings.optionalRules.altSettlementSizes) {
      const altSettlementMultiplier = totalLots > 40 ? this.districtCount : 1;

      // size
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

      // danger
      this.danger = pf1ks.config.altSettlementValues[this.size].danger * altSettlementMultiplier;

      // modifiers
      for (const modifier of Object.keys(pf1ks.config.allSettlementModifiers)) {
        const size = ["defense", "baseValue"].includes(modifier)
          ? 0
          : pf1ks.config.altSettlementValues[this.size].modifiers * altSettlementMultiplier;

        this.modifiers[modifier].total += size - this.modifiers[modifier].size;
        this.modifiers[modifier].size = size;

        if (modifier === "baseValue") {
          this.modifiers[modifier].total = Math.min(
            this.modifiers[modifier].total,
            pf1ks.config.altSettlementValues[this.size].maxBaseValue
          );
        }
      }
    }
  }

  _getChanges(target, type) {
    return this.parent.parent.changes
      .filter((c) => {
        if (
          Object.keys(pf1ks.config.allSettlementModifiers).includes(c.target) &&
          c.parent.system.settlementId !== this.id
        ) {
          return false;
        }
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
}
