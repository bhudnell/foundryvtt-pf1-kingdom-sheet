import { armyHD, armyConsumptionScaling, armySelectorOptions, armySizes } from "../../config.mjs";

export class ArmyModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      size: new fields.StringField({ choices: Object.keys(armySizes) }),
      hd: new fields.StringField({ choices: Object.keys(armyHD) }),
      hp: new fields.SchemaField({
        current: new fields.NumberField({ integer: true, min: 0 }),
      }),
      acr: new fields.NumberField(),
      tactics: new fields.SchemaField({
        value: new fields.ArrayField(new fields.StringField({ choices: Object.keys(armySelectorOptions.tactics) }), {
          initial: ["st", "wd"],
        }),
      }),
      resources: new fields.SchemaField({
        value: new fields.ArrayField(new fields.StringField({ choices: Object.keys(armySelectorOptions.resources) })),
        seCount: new fields.NumberField({ integer: true, min: 0 }),
      }),
      special: new fields.SchemaField({
        value: new fields.ArrayField(new fields.StringField({ choices: Object.keys(armySelectorOptions.special) })),
      }),
      speed: new fields.NumberField({ min: 0 }),
      morale: new fields.NumberField({ integer: true, min: -5, max: 4, initial: 0 }),
      commander: new fields.SchemaField({
        actor: new fields.ForeignDocumentField(pf1.documents.actor.ActorPF),
        boons: new fields.SchemaField({
          // TODO bonus tactic
          value: new fields.ArrayField(new fields.StringField({ choices: Object.keys(armySelectorOptions.boons) })),
        }),
      }),
      notes: new fields.HTMLField(),
    };
  }

  prepareBaseData() {
    for (const t of ["consumption", "om", "dv"]) {
      this[t] = {
        base: 0,
        resources: 0,
        boons: 0,
        total: 0,
      };
    }
  }

  prepareDerivedData() {
    this.hp.max = Math.floor((armyHD[this.hd] ?? 0) * this.acr);

    this.consumption.base = Math.max(Math.floor(this.acr / 2), 1);
    this.dv.base = Math.floor(10 + this.acr);
    this.om.base = Math.floor(this.acr);

    // resources
    if (this.resources.value.includes("ia")) {
      this.consumption.resources += Math.max(Math.floor(1 * armyConsumptionScaling[this.size]), 1);
      this.dv.resources += 1;
    }
    if (this.resources.value.includes("ma")) {
      this.consumption.resources += Math.max(Math.floor(2 * armyConsumptionScaling[this.size]), 1);
      this.dv.resources += 2;
    }
    if (this.resources.value.includes("iw")) {
      this.consumption.resources += Math.max(Math.floor(1 * armyConsumptionScaling[this.size]), 1);
      this.om.resources += 1;
    }
    if (this.resources.value.includes("mw")) {
      this.consumption.resources += Math.max(Math.floor(2 * armyConsumptionScaling[this.size]), 1);
      this.om.resources += 2;
    }
    if (this.resources.value.includes("mt")) {
      this.consumption.resources += Math.max(Math.floor(1 * armyConsumptionScaling[this.size]), 1);
      this.dv.resources += 2;
      this.om.resources += 2;
    }
    if (this.resources.value.includes("rw")) {
      this.consumption.resources += Math.max(Math.floor(1 * armyConsumptionScaling[this.size]), 1);
    }
    if (this.resources.value.includes("se")) {
      this.consumption.resources += 3 * this.resources.seCount;
      this.om.resources += 2;
    }

    // boons
    if (this.commander.boons.value.includes("dt")) {
      this.dv.boons += 2;
    }

    this.consumption.total = (this.consumption.base + this.consumption.resources + this.consumption.boons) * 4;
    this.dv.total = this.dv.base + this.dv.resources + this.dv.boons;
    this.om.total = this.om.base + this.om.resources + this.om.boons;

    // commander getters TODO these might need to be functions to speed up load times?
    this.commander.name = () => this.commander.actor?.name;
    this.commander.moraleBonus = () => {
      if (!this.commander.actor) {
        return 0;
      }

      const boonBonus = this.commander.boons.value.includes("lo") ? (this.commander.leadership < 12 ? 2 : 4) : 0;

      return (
        this.commander.actor.system.abilities.cha.mod +
        Math.floor((this.commander.actor.system.skills.pro.subSkills.soldier?.rank ?? 0) / 5) +
        boonBonus
      );
    };
    this.commander.leadership = () => {
      if (!this.commander.actor) {
        return 0;
      }
      const leadershipBonus = this.commander.actor.itemTypes.feat.some(
        (i) => i.name === "Leadership" && i.system.subType === "feat"
      )
        ? 3
        : 0;

      return (
        this.commander.actor.system.attributes.hd.total +
        this.commander.actor.system.abilities.cha.mod +
        leadershipBonus
      );
    };
    this.commander.maxBoons = () => {
      if (!this.commander.actor) {
        return 0;
      }

      return 1 + Math.floor((this.commander.actor.system.skills.pro.subSkills.soldier?.rank ?? 0) / 5);
    };
  }

  async rollMorale(options = {}) {
    const parts = [];

    if (this.morale) {
      parts.push(`${this.morale}[${game.i18n.localize("PF1KS.BaseMorale")}]`);
    }
    if (this.commander.moraleBonus) {
      parts.push(`${this.commander.moraleBonus}[${game.i18n.localize("PF1KS.CommanderBonus")}]`);
    }

    const actor = options.actor ?? this.actor; // TODO maybe needs to be parent?
    const token = options.token ?? this.token; // TODO maybe needs to be parent?

    const rollOptions = {
      ...options,
      parts,
      flavor: game.i18n.localize("PF1KS.Morale"),
      speaker: ChatMessage.getSpeaker({ actor, token, alias: token?.name }),
    };

    return await pf1.dice.d20Roll(rollOptions);
  }
}
