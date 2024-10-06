import { ChangeModel } from "./changeModel.mjs";

export class BuildingModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      settlementId: new fields.StringField(),
      amount: new fields.NumberField({ integer: true, min: 0, initial: 1, nullable: false }),
      lots: new fields.NumberField({ integer: true, min: 0, initial: 1, nullable: false }),
      changes: new fields.ArrayField(new fields.EmbeddedDataField(ChangeModel)),
    };
  }

  prepareDerivedData() {}
}
