export class KingdomModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {};
  }

  prepareBaseData() {}

  prepareDerivedData() {}

  _prepareChanges() {
    const changeItems = this.parent.items.filter((item) => item.system.changes?.length > 0);

    const changes = [];
    for (const i of changeItems) {
      changes.push(
        ...i.system.changes.map((c) => ({
          ...c,
          parentId: i.id,
          parentName: i.name,
        }))
      );
    }

    const c = new Collection();
    for (const change of changes) {
      // Avoid ID conflicts
      const parentId = change.parentId ?? "Actor";
      const uniqueId = `${parentId}-${change.id}`;
      c.set(uniqueId, change);
    }
    return c;
  }

  _getChanges(ability) {
    const abilityArr = Array.isArray(ability) ? ability : [ability];
    return this.changes.filter((c) => abilityArr.includes(c.ability)).reduce((total, c) => total + c.bonus, 0);
  }
}

function defineLeader(name) {
  return class LeaderModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
      const fields = foundry.data.fields;

      return {
        actorId: new fields.ForeignDocumentField(pf1.documents.actor.ActorPF, { idOnly: true }),
      };
    }

    _initialize(...args) {
      super._initialize(...args);

      this.id = name;
    }

    get name() {
      const leader = game.actors.get(this.actorId);

      if (!leader) {
        return undefined;
      }

      return leader.name;
    }

    get bonus() {
      const leader = game.actors.get(this.actorId);

      if (!leader) {
        return 0;
      }

      switch (this.id) {
        // TODO
        default:
          return 0;
      }
    }
  };
}
