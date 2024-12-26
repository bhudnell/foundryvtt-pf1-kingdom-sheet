import { ItemBaseModel } from "./itemBaseModel.mjs";

export class ImprovementModel extends ItemBaseModel {
  static defineSchema() {
    const fields = foundry.data.fields;

    const schema = {
      subType: new fields.StringField({ initial: "general", choices: Object.keys(pf1ks.config.improvementSubTypes) }),
      quantity: new fields.NumberField({ integer: true, min: 0, initial: 1, nullable: false }),
      settlementId: new fields.StringField(),
    };
    this.addDefaultSchemaFields(schema);

    return schema;
  }

  prepareDerivedData() {}
}
