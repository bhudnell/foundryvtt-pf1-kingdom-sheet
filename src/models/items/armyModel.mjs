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
          value: new fields.ArrayField(new fields.StringField({ choices: Object.keys(armySelectorOptions.boons) })),
        }),
      }),
    };
  }

  prepareBaseData() {
    this.consumption = {
      base: 0,
      resources: 0,
      total: 0,
    };
    this.dv = {
      base: 0,
      resources: 0,
      total: 0,
    };
    this.om = {
      base: 0,
      resources: 0,
      total: 0,
    };
  }

  prepareDerivedData() {
    this.hp.max = Math.floor(armyHD[this.hd] * this.acr);

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

    this.consumption.total = (this.consumption.base + this.consumption.resources) * 4;
    this.dv.total = this.dv.base + this.dv.resources;
    this.om.total = this.om.base + this.om.resources;

    // commander getters
    this.commander.chaMod = () => this.commander.actor?.system.abilities.cha.mod ?? 0;
    this.commander.profSol = () =>
      Math.floor((this.commander.actor?.system.skills.pro.subSkills.soldier?.rank ?? 0) / 5);
    this.commander.leadership = () =>
      (this.commander.actor?.system.attributes.hd.total ?? 0) + (this.commander.actor?.system.abilities.cha.mod ?? 0);
  }
}
