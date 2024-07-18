import { settlementModifiers, settlementValues } from "../config.mjs";

export class SettlementModel extends foundry.abstract.TypeDataModel {
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

  prepareBaseData() {
    this.corruption = {
      size: 0,
      government: 0,
      buildings: 0,
      events: 0,
      total: 0,
    };

    this.crime = {
      size: 0,
      government: 0,
      buildings: 0,
      events: 0,
      total: 0,
    };

    this.productivity = {
      size: 0,
      government: 0,
      buildings: 0,
      events: 0,
      total: 0,
    };

    this.law = {
      size: 0,
      government: 0,
      buildings: 0,
      events: 0,
      total: 0,
    };

    this.lore = {
      size: 0,
      government: 0,
      buildings: 0,
      events: 0,
      total: 0,
    };

    this.society = {
      size: 0,
      government: 0,
      buildings: 0,
      events: 0,
      total: 0,
    };
  }

  prepareDerivedData() {
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
      this[modifier].size = settlementValues[this.size].modifiers;
      this[modifier].government = 1000000; // TODO how to get kingdom government
      this[modifier].buildings = 1000000; // TODO how to get items on kingdom
      this[modifier].events = 1000000; // TODO how to get items on kingdom

      this[modifier].total =
        this[modifier].size + this[modifier].government + this[modifier].buildings + this[modifier].events;
    }
  }
}
