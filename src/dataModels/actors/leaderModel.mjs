export function defineLeader(role, bonusType, skillBonusType) {
  return class LeaderModel extends foundry.abstract.DataModel {
    _initialize(...args) {
      super._initialize(...args);

      if (!this.role) {
        this.role = role;
      }
      if (!this.bonusType) {
        this.bonusType = bonusType;
      }
      if (!this.skillBonusType) {
        this.skillBonusType = skillBonusType;
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
        role: new fields.StringField({ choices: Object.keys(pf1ks.config.leadershipRoles) }),
        bonusType: new fields.StringField({ choices: Object.keys(pf1ks.config.leadershipBonusOptions) }),
        skillBonusType: new fields.StringField({ choices: Object.keys(pf1ks.config.leadershipSkillBonuses) }),
      };
    }

    get actorId() {
      return this.actor?._id ?? undefined;
    }

    get name() {
      return this.actor?.name ?? undefined;
    }

    get bonus() {
      // the second part of this check is an arbitrary value that only exists if the referenced actor has been prepared
      if (!this.actor || !this.actor.system.abilities.cha.mod) {
        return 0;
      }

      const leadershipBonus = this.actor.itemTypes.feat.some(
        (i) => i.name === "Leadership" && i.system.subType === "feat"
      )
        ? 1
        : 0;

      switch (this.role) {
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

    get skillBonus() {
      if (!this.actor) {
        return 0;
      }

      let ranks = 0;

      switch (this.role) {
        case "ruler":
          ranks = this.actor.system.skills.kno.rank;
          break;
        case "consort":
          ranks = this.actor.system.skills.kno.rank;
          break;
        case "heir":
          ranks = this.actor.system.skills.kno.rank;
          break;
        case "councilor":
          ranks = this.actor.system.skills.klo.rank;
          break;
        case "general":
          ranks = this.actor.system.skills.pro.subSkills?.sol?.rank;
          break;
        case "diplomat":
          ranks = this.actor.system.skills.dip.rank;
          break;
        case "priest":
          ranks = this.actor.system.skills.kre.rank;
          break;
        case "magister":
          ranks = this.actor.system.skills.kar.rank;
          break;
        case "marshal":
          ranks = this.actor.system.skills.sur.rank;
          break;
        case "enforcer":
          ranks = this.actor.system.skills.int.rank;
          break;
        case "spymaster":
          ranks = this.actor.system.skills.sen.rank;
          break;
        case "treasurer":
          ranks = this.actor.system.skills.pro.subSkills?.mer?.rank;
          break;
        case "warden":
          ranks = this.actor.system.skills.ken.rank;
          break;
        case "viceroy":
          ranks = this.actor.system.skills.kge.rank;
          break;
      }

      return Math.floor((ranks ?? 0) / 5);
    }

    get vacant() {
      return !this.actor;
    }
  };
}
