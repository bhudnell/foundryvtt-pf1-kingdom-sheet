import { armyHD, armySizes, alignments, kingdomTacticId, armyStrategy, armyAttributes } from "../../config/config.mjs";

import { CommanderModel } from "./commanderModel.mjs";

export class ArmyModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      acr: new fields.NumberField(),
      type: new fields.StringField(),
      alignment: new fields.StringField({ choices: Object.keys(alignments) }),
      size: new fields.StringField({ choices: Object.keys(armySizes) }),
      hd: new fields.StringField({ choices: Object.keys(armyHD) }),
      strategy: new fields.StringField({ choices: Object.keys(armyStrategy), initial: "0" }),

      hp: new fields.SchemaField({
        current: new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      }),
      speed: new fields.SchemaField({
        base: new fields.NumberField({ min: 0 }),
      }),
      morale: new fields.SchemaField({
        base: new fields.NumberField({ integer: true, min: -5, max: 4, initial: 0 }),
      }),

      resources: new fields.SchemaField({
        potions: new fields.BooleanField(),
        impArmor: new fields.BooleanField(),
        magArmor: new fields.BooleanField(),
        impWeapons: new fields.BooleanField(),
        magWeapons: new fields.BooleanField(),
        mounts: new fields.BooleanField(),
        ranged: new fields.BooleanField(),
        seCount: new fields.NumberField({ required: true, integer: true, min: 0, initial: 0 }),
      }),

      commander: new fields.EmbeddedDataField(CommanderModel),

      notes: new fields.SchemaField({
        value: new fields.HTMLField({ required: false, blank: true }),
      }),
    };
  }

  prepareBaseData() {
    this.speed.total = 0;

    for (const stat of ["consumption", "om", "dv"]) {
      this[stat] = {
        base: 0,
        total: 0,
      };
    }

    this.damageBonus = { total: 0 };

    this.morale.commander = 0;
    this.morale.total = 0;

    this.tactics = {
      current: 0,
      max: {
        base: 0,
        total: 0,
      },
    };
  }

  prepareDerivedData() {
    this.hp.max = Math.floor((armyHD[this.hd] ?? 0) * this.acr);
    this.hp.current = Math.min(this.hp.current, this.hp.max);

    this.speed.total = this.speed.base;

    this.consumption.base = Math.max(Math.floor(this.acr / 2), 1);
    this.consumption.total = this.consumption.base;

    this.dv.base = Math.floor(10 + this.acr);
    this.dv.total = this.dv.base;

    this.om.base = Math.floor(this.acr);
    this.om.total = this.om.base;

    this.morale.commander = this.commander.moraleBonus;
    this.morale.total = this.morale.base + this.morale.commander;

    this.tactics.current = this.parent.itemTypes[kingdomTacticId].length;
    this.tactics.max.base = Math.max(0, Math.floor(this.acr / 2));
    this.tactics.max.total = this.tactics.max.base;

    if (this.acr < 1.0) {
      this.exp = Math.floor(Math.max(400 * this.acr, 0));
    } else {
      this.exp = pf1.config.CR_EXP_LEVELS[this.acr];
    }
  }

  async rollAttribute(attributeId, options = {}) {
    const check = this[attributeId];

    const parts = [];

    if (check.base) {
      parts.push(`${check.base}[${game.i18n.localize("PF1KS.Base")}]`);
    }
    if (check.commander) {
      parts.push(`${check.commander}[${game.i18n.localize("PF1KS.Army.Commander")}]`);
    }

    const changes = pf1.documents.actor.changes.getHighestChanges(
      this.changes.filter((c) => c.operator !== "set" && c.target === attributeId && c.value),
      { ignoreTarget: true }
    );

    for (const c of changes) {
      parts.push(`${c.value}[${c.flavor}]`);
    }

    const label = game.i18n.localize(armyAttributes[attributeId]);
    const actor = options.actor ?? this.actor;
    const token = options.token ?? this.token;

    const rollOptions = {
      ...options,
      parts,
      flavor: game.i18n.format("PF1KS.Army.AttributeRoll", { check: label }),
      speaker: ChatMessage.getSpeaker({ actor, token, alias: token?.name }),
    };

    return await pf1.dice.d20Roll(rollOptions);
  }

  get skills() {
    return {};
  }
}
