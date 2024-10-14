import { ItemBaseModel } from "./itemBaseModel.mjs";

export class TacticModel extends ItemBaseModel {
  static defineSchema() {
    const fields = foundry.data.fields;

    const schema = {
      disabled: new fields.BooleanField({ initial: true }),
    };
    this.addDefaultSchemaFields(schema);

    return schema;
  }

  prepareDerivedData() {}
}
