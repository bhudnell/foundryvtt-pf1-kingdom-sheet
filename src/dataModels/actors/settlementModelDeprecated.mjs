import { DistrictModel } from "./districtModel.mjs";

// TODO model deprecated for v4, remove eventually
export class SettlementModelDeprecated extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields;

    return {
      id: new fields.StringField({ required: true, nullable: false, blank: false }),
      name: new fields.StringField({ blank: true }),
      districtCount: new fields.NumberField({ integer: true, min: 0, initial: 1, nullable: false }),
      districts: new fields.ArrayField(new fields.EmbeddedDataField(DistrictModel)),
      magicItems: new fields.SchemaField({
        minor: new fields.ArrayField(new fields.StringField()),
        medium: new fields.ArrayField(new fields.StringField()),
        major: new fields.ArrayField(new fields.StringField()),
      }),
      attributes: new fields.SchemaField({
        // expanded settlement stuff
        government: new fields.StringField({
          initial: "aut",
          choices: Object.keys(pf1ks.config.settlementGovernments),
        }),
        alignment: new fields.StringField({ blank: true, choices: Object.keys(pf1.config.alignments) }),
      }),
    };
  }
}
