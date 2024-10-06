import { improvementSubTypes } from "../../config/config.mjs";

import { ChangeModel } from "./changeModel.mjs";

export class ImprovementModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;

    return {
      description: new fields.HTMLField(),
      subType: new fields.StringField({ initial: "general", choices: Object.keys(improvementSubTypes) }),
      amount: new fields.NumberField({ integer: true, min: 0, initial: 1, nullable: false }),
      settlementId: new fields.StringField(),
      changes: new fields.ArrayField(new fields.EmbeddedDataField(ChangeModel)),
    };
  }

  prepareDerivedData() {}
}
