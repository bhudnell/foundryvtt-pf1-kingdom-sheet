export class ActorProxyModel extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields;

    return {
      id: new fields.StringField({ required: false, nullable: true, blank: true, initial: "" }),
      actor: new fields.ForeignDocumentField(pf1.documents.actor.ActorBasePF, { required: true }),
    };
  }
}
