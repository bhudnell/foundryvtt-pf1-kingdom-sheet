import { allChangeTargets } from "../config.mjs";

export class ChangeModel extends foundry.abstract.DataModel {
  _initialize(...args) {
    super._initialize(...args);

    this.id = foundry.utils.randomID();
  }

  static defineSchema() {
    const fields = foundry.data.fields;

    return {
      target: new fields.StringField({ blank: true, choices: Object.keys(allChangeTargets) }),
      bonus: new fields.NumberField({ integer: true }),
    };
  }
}
