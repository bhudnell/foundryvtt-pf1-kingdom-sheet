import { ItemBaseModel } from "./itemBaseModel.mjs";

export class BuildingModel extends ItemBaseModel {
  static defineSchema() {
    const fields = foundry.data.fields;

    const schema = {
      settlementId: new fields.StringField(),
      districtId: new fields.StringField(),
      // TODO this is deprecated and will need to be removed eventually
      quantity: new fields.NumberField({ integer: true, min: 0, initial: 1, nullable: false }),
      type: new fields.StringField({ choices: Object.keys(pf1ks.config.buildingTypes) }),
      customLotSize: new fields.NumberField({ integer: true, min: 0, initial: 1, nullable: false }),
      customCost: new fields.NumberField({ integer: true, min: 0, initial: 0, nullable: false }),
      damaged: new fields.BooleanField({ initial: false }),
      // placement
      x: new fields.NumberField({ integer: true, min: 0, max: 5, initial: null }),
      y: new fields.NumberField({ integer: true, min: 0, max: 5, initial: null }),
      width: new fields.NumberField({ integer: true, min: 0, max: 6, initial: 1, nullable: false }),
      height: new fields.NumberField({ integer: true, min: 0, max: 6, initial: 1, nullable: false }),
    };
    this.addDefaultSchemaFields(schema);

    return schema;
  }

  get lotSize() {
    if (this.type === "custom") {
      return this.customLotSize;
    }
    return pf1ks.config.buildingTypes[this.type].lotSize;
  }

  get cost() {
    if (this.type === "custom") {
      return this.customCost;
    }
    return pf1ks.config.buildingTypes[this.type].cost;
  }

  prepareDerivedData() {}
}
