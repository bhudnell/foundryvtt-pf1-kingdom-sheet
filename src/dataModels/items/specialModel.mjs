import { ItemBaseModel } from "./itemBaseModel.mjs";

export class SpecialModel extends ItemBaseModel {
  static defineSchema() {
    const fields = foundry.data.fields;

    const schema = {};
    this.addDefaultSchemaFields(schema);

    return schema;
  }

  prepareDerivedData() {}
}
