import { allChangeTargets } from "../config.mjs";

export class ChangeModel extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields;

    return {
      id: new fields.StringField({
        blank: false,
        initial: () => foundry.utils.randomID(),
        required: true,
        readonly: true,
      }),
      target: new fields.StringField({ blank: true, choices: Object.keys(allChangeTargets) }),
      bonus: new fields.NumberField({ integer: true }),
    };
  }
}
