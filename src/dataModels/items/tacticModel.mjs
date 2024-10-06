import { ChangeModel } from "./changeModel.mjs";

export class TacticModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      disabled: new fields.BooleanField({ initial: true }),
      changes: new fields.ArrayField(new fields.EmbeddedDataField(ChangeModel)),
    };
  }

  prepareDerivedData() {}
}
