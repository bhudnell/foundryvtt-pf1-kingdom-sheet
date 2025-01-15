import { ItemBaseModel } from "./itemBaseModel.mjs";

export class EventModel extends ItemBaseModel {
  static defineSchema() {
    const fields = foundry.data.fields;

    const schema = {
      subType: new fields.StringField({ initial: "active", choices: Object.keys(pf1ks.config.eventSubTypes) }),
      settlementId: new fields.StringField(),
      continuous: new fields.BooleanField({ initial: false }),
      turn: new fields.NumberField({ integer: true, min: 0 }),
    };
    this.addDefaultSchemaFields(schema);

    return schema;
  }

  prepareDerivedData() {}
}
