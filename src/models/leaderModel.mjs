import { kingdomStats } from "../config.mjs";

export function defineLeader(type, bonusType) {
  return class LeaderModel extends foundry.abstract.DataModel {
    _initialize(...args) {
      super._initialize(...args);

      this.type = type;
      if (bonusType) {
        this.bonusTypes = [bonusType];
      }
    }

    static defineSchema() {
      const fields = foundry.data.fields;

      return {
        id: new fields.StringField({
          blank: false,
          initial: () => foundry.utils.randomID(),
          required: true,
          readonly: true,
        }),
        actor: new fields.ForeignDocumentField(pf1.documents.actor.ActorPF),
        bonusTypes: new fields.ArrayField(
          new fields.StringField({ blank: true, choices: [Object.keys(kingdomStats)] })
        ),
      };
    }

    get name() {
      return this.actor?.name ?? undefined;
    }

    get bonus() {
      if (!this.actor) {
        return 0;
      }

      const leadershipBonus = this.actor.itemTypes.feat.some(
        (i) => i.name === "Leadership" && i.system.subType === "feat"
      )
        ? 1
        : 0;

      switch (this.type) {
        case "ruler":
          return this.actor.system.abilities.cha.mod + leadershipBonus;
        case "consort":
        case "heir":
          return Math.floor(this.actor.system.abilities.cha.mod / 2) + leadershipBonus;
        case "councilor":
        case "priest":
          return Math.max(this.actor.system.abilities.cha.mod, this.actor.system.abilities.wis.mod) + leadershipBonus;
        case "general":
          return Math.max(this.actor.system.abilities.cha.mod, this.actor.system.abilities.str.mod) + leadershipBonus;
        case "diplomat":
        case "magister":
          return Math.max(this.actor.system.abilities.cha.mod, this.actor.system.abilities.int.mod) + leadershipBonus;
        case "marshal":
          return Math.max(this.actor.system.abilities.dex.mod, this.actor.system.abilities.wis.mod) + leadershipBonus;
        case "enforcer":
          return Math.max(this.actor.system.abilities.dex.mod, this.actor.system.abilities.str.mod) + leadershipBonus;
        case "spymaster":
          return Math.max(this.actor.system.abilities.dex.mod, this.actor.system.abilities.int.mod) + leadershipBonus;
        case "treasurer":
          return Math.max(this.actor.system.abilities.int.mod, this.actor.system.abilities.wis.mod) + leadershipBonus;
        case "warden":
          return Math.max(this.actor.system.abilities.con.mod, this.actor.system.abilities.str.mod) + leadershipBonus;
        case "viceroy":
          return (
            Math.floor(Math.max(this.actor.system.abilities.int.mod, this.actor.system.abilities.wis.mod) / 2) +
            leadershipBonus
          );
        default:
          return 0;
      }
    }

    get vacant() {
      return !this.actor;
    }
  };
}
