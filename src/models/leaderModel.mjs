export function defineLeader(type) {
  return class LeaderModel extends foundry.abstract.TypeDataModel {
    _initialize(...args) {
      super._initialize(...args);

      this.type = type;
      this.id = foundry.utils.randomID();
    }

    static defineSchema() {
      const fields = foundry.data.fields;

      return {
        actorId: new fields.ForeignDocumentField(pf1.documents.actor.ActorPF, { idOnly: true }),
      };
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

      switch (this.type) {
        // TODO
        default:
          return 0;
      }
    }

    get vacantPenalty() {
      const leader = game.actors.get(this.actorId);

      if (leader) {
        return 0;
      }

      switch (this.type) {
        // TODO
        default:
          return 0;
      }
    }
  };
}
