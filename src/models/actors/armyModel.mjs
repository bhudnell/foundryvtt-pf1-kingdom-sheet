import { armyHD, armyConsumptionScaling, armySelectorOptions, armySizes, alignments } from "../../config.mjs";

import { CommanderModel } from "./commanderModel.mjs";

export class ArmyModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      alignment: new fields.StringField({ choices: Object.keys(alignments) }),
      size: new fields.StringField({ choices: Object.keys(armySizes) }),
      type: new fields.StringField(),
      hd: new fields.StringField({ choices: Object.keys(armyHD) }),
      hp: new fields.SchemaField({
        current: new fields.NumberField({ integer: true, min: 0 }),
      }),
      acr: new fields.NumberField(),
      seCount: new fields.NumberField({ integer: true, min: 0 }),
      speed: new fields.NumberField({ min: 0 }),
      morale: new fields.NumberField({ integer: true, min: -5, max: 4, initial: 0 }),
      commander: new fields.EmbeddedDataField(CommanderModel),
      notes: new fields.HTMLField(),
    };
  }

  prepareBaseData() {
    for (const stat of ["consumption", "om", "dv"]) {
      this[stat] = {
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

    // todo item change handling

    this.consumption.total = (this.consumption.base + this.consumption.resources + this.consumption.boons) * 4;
    this.dv.total = this.dv.base + this.dv.resources + this.dv.boons;
    this.om.total = this.om.base + this.om.resources + this.om.boons;
  }

  async rollMorale(options = {}) {
    const parts = [];

    if (this.morale) {
      parts.push(`${this.morale}[${game.i18n.localize("PF1KS.BaseMorale")}]`);
    }
    if (this.commander.moraleBonus) {
      parts.push(`${this.commander.moraleBonus}[${game.i18n.localize("PF1KS.CommanderBonus")}]`);
    }

    const actor = options.actor ?? this.actor;
    const token = options.token ?? this.token;

    const rollOptions = {
      ...options,
      parts,
      flavor: game.i18n.localize("PF1KS.Morale"),
      speaker: ChatMessage.getSpeaker({ actor, token, alias: token?.name }),
    };

    return await pf1.dice.d20Roll(rollOptions);
  }
}
