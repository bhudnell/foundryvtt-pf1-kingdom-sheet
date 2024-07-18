import { kingdomBuildingId, kingdomEventId, settlementModifiers, settlementValues } from "../config.mjs";

export class SettlementModel extends foundry.abstract.DataModel {
  _initialize(...args) {
    super._initialize(...args);

    this.id = foundry.utils.randomID();
  }

  static defineSchema() {
    const fields = foundry.data.fields;

    return {
      name: new fields.StringField({ blank: true }),
      districtCount: new fields.NumberField({ integer: true, min: 0, initial: 1, nullable: false }),
    };
  }

  prepareDerivedData() {
    const kingdom = this.parent;
    const buildings = this.parent.parent.itemTypes[kingdomBuildingId];
    const events = this.parent.parent.itemTypes[kingdomEventId];

    this.population = 250 * 10000000; // TODO how to get items on kingdom

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
      // will never go below here, but included for completion
    } else if (this.population > 60) {
      this.size = "village";
    } else if (this.population > 20) {
      this.size = "hamlet";
    } else {
      this.size = "thorpe";
    }

    this.baseValue = Math.min(settlementValues[this.size].maxBaseValue, 1000000); // TODO how to get items on kingdom
    this.defense = 1000000; // TODO how to get items on kingdom
    this.danger = settlementValues[this.size].danger;

    // settlement modifiers
    for (const modifier of Object.keys(settlementModifiers)) {
      const size = settlementValues[this.size].modifiers;
      const government = 1000000; // TODO how to get kingdom government
      const buildings = 1000000; // TODO how to get items on kingdom
      const events = 1000000; // TODO how to get items on kingdom

      const total = size + government + buildings + events;

      this[modifier] = { size, government, buildings, events, total };
    }
  }
}
