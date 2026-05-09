export class MagicItemModel extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields;

    return {
      items: new fields.ArrayField(new fields.StringField()),
      max: new fields.NumberField({ integer: true, initial: 0, nullable: false }),
    };
  }

  get current() {
    return this.items.length;
  }
}
