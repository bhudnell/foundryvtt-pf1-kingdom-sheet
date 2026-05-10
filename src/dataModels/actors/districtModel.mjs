export class DistrictModel extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields;

    return {
      id: new fields.StringField({ required: true, nullable: false, blank: false }),
      name: new fields.StringField({ blank: true }),
      borders: new fields.SchemaField({
        north: new fields.StringField({ choices: Object.keys(pf1ks.config.districtBorders), initial: "land" }),
        south: new fields.StringField({ choices: Object.keys(pf1ks.config.districtBorders), initial: "land" }),
        east: new fields.StringField({ choices: Object.keys(pf1ks.config.districtBorders), initial: "land" }),
        west: new fields.StringField({ choices: Object.keys(pf1ks.config.districtBorders), initial: "land" }),
      }),
    };
  }
}
