import { ItemBaseModel } from "./itemBaseModel.mjs";

export class BuildingModel extends ItemBaseModel {
  static defineSchema() {
    const fields = foundry.data.fields;

    const schema = {
      settlementId: new fields.StringField(),
      amount: new fields.NumberField({ integer: true, min: 0, initial: 1, nullable: false }),
      lots: new fields.NumberField({ integer: true, min: 0, initial: 1, nullable: false }),
    };
    this.addDefaultSchemaFields(schema);

    return schema;
  }

  prepareDerivedData() {}
}
