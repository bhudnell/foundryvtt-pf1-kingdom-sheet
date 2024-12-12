import { ItemBaseModel } from "./itemBaseModel.mjs";

export class BuildingModel extends ItemBaseModel {
  static defineSchema() {
    const fields = foundry.data.fields;

    const schema = {
      settlementId: new fields.StringField(),
      quantity: new fields.NumberField({ integer: true, min: 0, initial: 1, nullable: false }),
      lots: new fields.NumberField({ integer: true, min: 0, initial: 1, nullable: false }),
      type: new fields.StringField({ choices: Object.keys(pf1ks.config.buildingTypes) }),
      cost: new fields.NumberField({ integer: true, min: 0, initial: 0, nullable: false }),
    };
    this.addDefaultSchemaFields(schema);

    return schema;
  }

  prepareDerivedData() {}
}
