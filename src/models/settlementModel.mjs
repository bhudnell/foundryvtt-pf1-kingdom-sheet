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
      other: 0,
      total: 0,
    };

    this.crime = {
      size: 0,
      government: 0,
      buildings: 0,
      other: 0,
      total: 0,
    };

    this.productivity = {
      size: 0,
      government: 0,
      buildings: 0,
      other: 0,
      total: 0,
    };

    this.law = {
      size: 0,
      government: 0,
      buildings: 0,
      other: 0,
      total: 0,
    };

    this.lore = {
      size: 0,
      government: 0,
      buildings: 0,
      other: 0,
      total: 0,
    };

    this.society = {
      size: 0,
      government: 0,
      buildings: 0,
      other: 0,
      total: 0,
    };
  }

  prepareDerivedData() {
    // TODO all below
    this.baseValue = 0;
    this.defense = 0;
    this.population = 0;
    this.size = "";
    this.danger = 0;

    // TODO settlement modifiers
  }
}
