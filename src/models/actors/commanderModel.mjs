import { kingdomBoonId } from "../../config.mjs";

export class CommanderModel extends foundry.abstract.DataModel {
  static defineSchema() {
    const fields = foundry.data.fields;

    return {
      actor: new fields.ForeignDocumentField(pf1.documents.actor.ActorPF),
      kingdomLeader: new fields.BooleanField({ initial: false }),
    };
  }

  get name() {
    return this.actor?.name;
  }

  get moraleBonus() {
    if (!this.actor) {
      return 0;
    }
    const boonBonus = this.parent.parent.itemTypes[kingdomBoonId].some((i) => i.name === "Loyalty")
      ? this.leadership < 12
        ? 2
        : 4
      : 0;

    const soldierBonus = Math.floor((this.actor.system.skills.pro.subSkills.soldier?.rank ?? 0) / 5);
    const hdBonus = Math.floor(this.actor.system.attributes.hd.total / 6);

    return this.actor.system.abilities.cha.mod + Math.max(soldierBonus, this.kingdomLeader ? hdBonus : 0) + boonBonus;
  }
  get leadership() {
    if (!this.actor) {
      return 0;
    }
    const leadershipBonus = this.actor.itemTypes.feat.some(
      (i) => i.name === "Leadership" && i.system.subType === "feat"
    )
      ? 3
      : 0;

    return this.actor.system.attributes.hd.total + this.actor.system.abilities.cha.mod + leadershipBonus;
  }
  get maxBoons() {
    if (!this.actor) {
      return 0;
    }

    const soldierBonus = Math.floor((this.actor.system.skills.pro.subSkills.soldier?.rank ?? 0) / 5);
    const hdBonus = Math.floor(this.actor.system.attributes.hd.total / 6);

    return 1 + Math.max(soldierBonus, this.kingdomLeader ? hdBonus : 0);
  }
}
