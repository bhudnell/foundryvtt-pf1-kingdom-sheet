import { kingdomStats } from "../config.mjs";

export function defineLeader(type, bonusType) {
  return class LeaderModel extends foundry.abstract.DataModel {
    _initialize(...args) {
      super._initialize(...args);

      this.type = type;
      this.id = foundry.utils.randomID();
      this.bonusTypes = bonusType ? [bonusType] : [];
    }

    static defineSchema() {
      const fields = foundry.data.fields;

      return {
        actorId: new fields.ForeignDocumentField(pf1.documents.actor.ActorPF, { idOnly: true }),
        bonusTypes: new fields.ArrayField(
          new fields.StringField({ blank: true, choices: [Object.keys(kingdomStats)] }),
          { initial: [] }
        ),
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

      const leadershipBonus = leader.itemTypes.feat.some((i) => i.name === "Leadership" && i.system.subType === "feat")
        ? 1
        : 0;

      switch (this.type) {
        case "ruler":
          return leader.system.abilities.cha.mod + leadershipBonus;
        case "consort":
        case "heir":
          return Math.floor(leader.system.abilities.cha.mod / 2) + leadershipBonus;
        case "councilor":
        case "priest":
          return Math.max(leader.system.abilities.cha.mod, leader.system.abilities.wis.mod) + leadershipBonus;
        case "general":
          return Math.max(leader.system.abilities.cha.mod, leader.system.abilities.str.mod) + leadershipBonus;
        case "diplomat":
        case "magister":
          return Math.max(leader.system.abilities.cha.mod, leader.system.abilities.int.mod) + leadershipBonus;
        case "marshal":
          return Math.max(leader.system.abilities.dex.mod, leader.system.abilities.wis.mod) + leadershipBonus;
        case "enforcer":
          return Math.max(leader.system.abilities.dex.mod, leader.system.abilities.str.mod) + leadershipBonus;
        case "spymaster":
          return Math.max(leader.system.abilities.dex.mod, leader.system.abilities.int.mod) + leadershipBonus;
        case "treasurer":
          return Math.max(leader.system.abilities.int.mod, leader.system.abilities.wis.mod) + leadershipBonus;
        case "warden":
          return Math.max(leader.system.abilities.con.mod, leader.system.abilities.str.mod) + leadershipBonus;
        case "viceroy":
          return (
            Math.floor(Math.max(leader.system.abilities.int.mod, leader.system.abilities.wis.mod) / 2) + leadershipBonus
          );
        default:
          return 0;
      }
    }

    get vacant() {
      return !this.actorId;
    }
  };
}
