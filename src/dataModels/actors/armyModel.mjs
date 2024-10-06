import {
  armyHD,
  armyConsumptionScaling,
  armySizes,
  alignments,
  kingdomTacticId,
  armyStrategy,
  armyAttributes,
} from "../../config/config.mjs";

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
      speed: new fields.NumberField({ min: 0 }),
      strategy: new fields.StringField({ choices: Object.keys(armyStrategy), initial: "0" }),
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
        seCount: new fields.NumberField({ integer: true, min: 0, initial: 0 }),
      }),
      commander: new fields.EmbeddedDataField(CommanderModel),
      notes: new fields.HTMLField(),
    };
  }

  prepareBaseData() {
    for (const stat of ["consumption", "om", "dv"]) {
      this[stat] = {
        base: 0,
        tactics: 0,
        resources: 0,
        special: 0,
        boons: 0,
        total: 0,
      };
    }

    this.morale.tactics = 0;
    this.morale.special = 0;
    this.morale.boons = 0;
    this.morale.commander = 0;
    this.morale.total = 0;

    this.om.strategy = 0;
    this.dv.strategy = 0;
    this.damageBonus = 0;

    this.tactics = {
      current: 0,
      max: 0,
    };
  }

  prepareDerivedData() {
    this.hp.max = Math.floor((armyHD[this.hd] ?? 0) * this.acr);
    this.hp.current = Math.min(this.hp.current, this.hp.max);

    this.consumption.base = Math.max(Math.floor(this.acr / 2), 1);
    this.dv.base = Math.floor(10 + this.acr);
    this.om.base = Math.floor(this.acr);

    this.om.strategy = this.strategy * 2;
    this.dv.strategy = this.strategy * -2;
    this.damageBonus = this.strategy * 3;

    this.morale.commander = this.commander.moraleBonus;

    for (const stat of ["consumption", "om", "dv", "morale"]) {
      this[stat].tactics = 0; // todo item change handling
      this[stat].special = 0; // todo item change handling
      this[stat].boons = 0; // todo item change handling
    }

    this._prepareResources();

    this.consumption.total =
      (this.consumption.base +
        this.consumption.tactics +
        this.consumption.resources +
        this.consumption.special +
        this.consumption.boons) *
      4;
    this.dv.total =
      this.dv.base + this.dv.tactics + this.dv.resources + this.dv.special + this.dv.boons + this.dv.strategy;
    this.om.total =
      this.om.base + this.om.tactics + this.om.resources + this.om.special + this.om.boons + this.om.strategy;
    this.morale.total =
      this.morale.base + this.morale.tactics + this.morale.special + this.morale.boons + this.morale.commander;

    this.tactics.current = this.parent.itemTypes[kingdomTacticId].length;
    this.tactics.max = Math.max(0, Math.floor(this.acr / 2));

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
    if (check.tactics) {
      parts.push(`${check.tactics}[${game.i18n.localize("PF1KS.Army.Tactics")}]`);
    }
    if (check.special) {
      parts.push(`${check.special}[${game.i18n.localize("PF1KS.Army.Special")}]`);
    }
    if (check.boons) {
      parts.push(`${check.boons}[${game.i18n.localize("PF1KS.Army.Boons")}]`);
    }
    if (check.resources) {
      parts.push(`${check.resources}[${game.i18n.localize("PF1KS.Army.ResourcesLabel")}]`);
    }
    if (check.strategy) {
      parts.push(`${check.strategy}[${game.i18n.localize("PF1KS.Army.StrategyLabel")}]`);
    }
    if (check.commander) {
      parts.push(`${check.commander}[${game.i18n.localize("PF1KS.Army.Commander")}]`);
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

  _prepareResources() {
    if (this.resources.impArmor) {
      this.dv.resources += 1;
      this.consumption.resources += 1;
    }
    if (this.resources.magArmor) {
      this.dv.resources += 2;
      this.consumption.resources += 2;
    }
    if (this.resources.impWeapons) {
      this.om.resources += 1;
      this.consumption.resources += 1;
    }
    if (this.resources.magWeapons) {
      this.om.resources += 2;
      this.consumption.resources += 2;
    }
    if (this.resources.mounts) {
      this.dv.resources += 2;
      this.om.resources += 2;
      this.consumption.resources += 1;
    }
    if (this.resources.ranged) {
      this.consumption.resources += 1;
    }

    // multiply consumption by scaling factor
    this.consumption.resources = Math.floor(this.consumption.resources * (armyConsumptionScaling[this.size] ?? 1));

    if (this.resources.seCount) {
      this.om.resources += 2;
      this.consumption.resources += 3 * this.seCount;
    }
  }
}
