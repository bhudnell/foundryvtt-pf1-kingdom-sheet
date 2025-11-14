import { ItemBaseModel } from "./itemBaseModel.mjs";

export class FeatureModel extends ItemBaseModel {
  static defineSchema() {
    const fields = foundry.data.fields;

    const schema = {
      subType: new fields.StringField({ initial: "quality", choices: Object.keys(pf1ks.config.featureSubTypes) }),
      settlementId: new fields.StringField(),
    };
    this.addDefaultSchemaFields(schema);

    return schema;
  }

  prepareDerivedData() {}
}
