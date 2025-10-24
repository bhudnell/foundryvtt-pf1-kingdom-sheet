export class DistrictModel extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields;

    return {
      id: new fields.StringField({ required: true, nullable: false, blank: false }),
      // img: new fields.FilePathField({ categories: ["IMAGE"] }), // TODO revisit for foundry v13 compatibility. See https://github.com/foundryvtt/foundryvtt/issues/11471
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
