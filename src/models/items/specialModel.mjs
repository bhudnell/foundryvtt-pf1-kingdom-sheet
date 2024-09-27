import { ChangeModel } from "./changeModel.mjs";

export class SpecialModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      changes: new fields.ArrayField(new fields.EmbeddedDataField(ChangeModel)),
    };
  }

  prepareDerivedData() {}
}
