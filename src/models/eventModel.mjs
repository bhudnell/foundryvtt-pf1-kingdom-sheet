import { eventSubTypes } from "../config.mjs";

import { ChangeModel } from "./changeModel.mjs";

export class EventModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      description: new fields.HTMLField(),
      subType: new fields.StringField({ initial: "active", choices: Object.keys(eventSubTypes) }),
      settlementId: new fields.StringField(),
      continuous: new fields.BooleanField({ initial: false }),
      changes: new fields.ArrayField(new fields.EmbeddedDataField(ChangeModel)),
    };
  }

  prepareDerivedData() {}
}
