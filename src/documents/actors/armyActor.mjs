import { armyBuffTargets, commonBuffTargets } from "../../config/buffTargets.mjs";
import { DefaultChange } from "../../util/utils.mjs";

import { BaseActor } from "./baseActor.mjs";

export class ArmyActor extends BaseActor {
  async rollAttribute(attributeId, options = {}) {
    const {
      skipDialog = pf1.documents.settings.getSkipActionPrompt(),
      staticRoll = null,
      chatMessage = true,
      compendium,
      noSound = false,
      dice = pf1.dice.D20RollPF.standardRoll,
      subject,
      bonus = "",
      messageData = undefined,
    } = options;

    const check = this.system[attributeId];

    const parts = [];
    const props = [];

    if (check.base) {
      parts.push(`${check.base}[${game.i18n.localize("PF1.Base")}]`);
    }
    if (check.commander) {
      parts.push(`${check.commander}[${game.i18n.localize("PF1KS.Army.Commander")}]`);
    }

    const changes = pf1.documents.actor.changes.getHighestChanges(
      this.changes.filter(
        (c) => c.operator !== "set" && c.target === `${pf1ks.config.changePrefix}_${attributeId}` && c.value
      ),
      { ignoreTarget: true }
    );

    for (const c of changes) {
      parts.push(`${c.value}[${c.flavor}]`);
    }

    // add damange bonus to OM roll
    let damageBonus, damageTooltip;
    if (attributeId === "om") {
      const tooltipParts = [];
      const damageChanges = pf1.documents.actor.changes.getHighestChanges(
        this.changes.filter(
          (c) => c.operator !== "set" && c.target === `${pf1ks.config.changePrefix}_damage` && c.value
        ),
        { ignoreTarget: true }
      );
      for (const c of damageChanges) {
        tooltipParts.push({
          flavor: c.flavor,
          total: c.value.signedString(),
        });
      }

      damageTooltip = await renderTemplate("systems/pf1/templates/dice/tooltip.hbs", { parts: tooltipParts });
      damageBonus = this.system.damageBonus;
    }

    // Add context notes
    const rollData = options.rollData || this.getRollData();

    const notes = await this.getContextNotesParsed(`${pf1ks.config.changePrefix}_${attributeId}`, null, { rollData });
    if (attributeId === "om") {
      notes.push(...(await this.getContextNotesParsed(`${pf1ks.config.changePrefix}_damage`, null, { rollData })));
    }
    if (notes.length > 0) {
      props.push({ header: game.i18n.localize("PF1.Notes"), value: notes });
    }

    const label = pf1ks.config.armyAttributes[attributeId];
    const actor = options.actor ?? this;
    const token = options.token ?? this.token;

    let rollMode = options.rollMode;

    const formula = [dice, ...parts].join("+");
    const flavor = game.i18n.format("PF1KS.Army.AttributeRoll", { check: label });
    const speaker = ChatMessage.getSpeaker({ actor, token, alias: token?.name });

    const roll = new pf1.dice.D20RollPF(formula, rollData, { flavor, staticRoll, bonus }, { speaker });
    if (!skipDialog) {
      const title = speaker?.alias ? `${speaker.alias}: ${flavor}` : flavor;
      const dialogResult = await roll.promptDialog({ title, rollMode, subject, speaker });
      if (dialogResult === null) {
        return;
      }

      // Move roll mode selection from roll data
      rollMode = roll.options.rollMode;
      delete roll.options.rollMode;
    }

    const chatTemplate = `modules/${pf1ks.config.moduleId}/templates/chat/army-attribute-roll.hbs`;
    const chatTemplateData = { properties: props, damageBonus, damageTooltip };

    const mData = foundry.utils.mergeObject(
      {
        type: "check",
        style: CONST.CHAT_MESSAGE_STYLES.OTHER,
        rolls: [roll],
      },
      messageData
    );

    return roll.toMessage(
      { ...mData, speaker },
      { create: chatMessage, noSound, chatTemplate, chatTemplateData, compendium, subject, rollMode }
    );
  }

  _prepareTypeChanges(changes) {
    const system = this.system;

    // strategy
    changes.push(
      new DefaultChange((system.strategy - 2) * -2, `${pf1ks.config.changePrefix}_dv`, "PF1KS.Army.StrategyLabel"),
      new DefaultChange((system.strategy - 2) * 2, `${pf1ks.config.changePrefix}_om`, "PF1KS.Army.StrategyLabel"),
      new DefaultChange((system.strategy - 2) * 3, `${pf1ks.config.changePrefix}_damage`, "PF1KS.Army.StrategyLabel")
    );

    // resources
    const consumptionFactor = pf1ks.config.armyConsumptionScaling[system.size] ?? 1;
    if (system.resources.impArmor) {
      changes.push(
        new DefaultChange(1, `${pf1ks.config.changePrefix}_dv`, "PF1KS.Army.Resources.ImpArmor"),
        new DefaultChange(
          Math.max(Math.floor(consumptionFactor), 1),
          `${pf1ks.config.changePrefix}_consumption`,
          "PF1KS.Army.Resources.ImpArmor"
        )
      );
    }
    if (system.resources.magArmor) {
      changes.push(
        new DefaultChange(2, `${pf1ks.config.changePrefix}_dv`, "PF1KS.Army.Resources.MagArmor"),
        new DefaultChange(
          Math.max(Math.floor(2 * consumptionFactor), 1),
          `${pf1ks.config.changePrefix}_consumption`,
          "PF1KS.Army.Resources.MagArmor"
        )
      );
    }
    if (system.resources.impWeapons) {
      changes.push(
        new DefaultChange(1, `${pf1ks.config.changePrefix}_om`, "PF1KS.Army.Resources.ImpWeapons"),
        new DefaultChange(
          Math.max(Math.floor(consumptionFactor), 1),
          `${pf1ks.config.changePrefix}_consumption`,
          "PF1KS.Army.Resources.ImpWeapons"
        )
      );
    }
    if (system.resources.magWeapons) {
      changes.push(
        new DefaultChange(2, `${pf1ks.config.changePrefix}_om`, "PF1KS.Army.Resources.MagWeapons"),
        new DefaultChange(
          Math.max(Math.floor(2 * consumptionFactor), 1),
          `${pf1ks.config.changePrefix}_consumption`,
          "PF1KS.Army.Resources.MagWeapons"
        )
      );
    }
    if (system.resources.mounts) {
      changes.push(
        new DefaultChange(2, `${pf1ks.config.changePrefix}_dv`, "PF1KS.Army.Resources.Mounts"),
        new DefaultChange(2, `${pf1ks.config.changePrefix}_om`, "PF1KS.Army.Resources.Mounts"),
        new DefaultChange(
          Math.max(Math.floor(consumptionFactor), 1),
          `${pf1ks.config.changePrefix}_consumption`,
          "PF1KS.Army.Resources.Mounts"
        )
      );
    }
    if (system.resources.ranged) {
      changes.push(
        new DefaultChange(
          Math.max(Math.floor(consumptionFactor), 1),
          `${pf1ks.config.changePrefix}_consumption`,
          "PF1KS.Army.Resources.Ranged"
        )
      );
    }

    if (system.resources.seCount) {
      changes.push(
        new DefaultChange(2, `${pf1ks.config.changePrefix}_om`, "PF1KS.Army.Resources.Siege"),
        new DefaultChange(
          3 * system.resources.seCount,
          `${pf1ks.config.changePrefix}_consumption`,
          "PF1KS.Army.Resources.Siege"
        )
      );
    }
  }

  _prepareConditionChanges(changes) {
    for (const [con, v] of Object.entries(this.system.conditions)) {
      if (!v) {
        continue;
      }
      const condition = pf1ks.config.armyConditions[con];
      if (!condition) {
        continue;
      }

      const mechanic = condition.mechanics;
      if (!mechanic) {
        continue;
      }

      for (const change of mechanic.changes ?? []) {
        const changeData = { ...change, flavor: condition.name };
        const changeObj = new pf1.components.ItemChange(changeData);
        changes.push(changeObj);
      }
    }
  }

  getSourceDetails(path) {
    const sources = super.getSourceDetails(path);

    const baseLabel = game.i18n.localize("PF1.Base");

    const attrRE = /^system\.(?<attr>\w+)\.total$/.exec(path);
    if (attrRE) {
      const { attr } = attrRE.groups;

      if (["dv", "om", "consumption", "morale"].includes(attr)) {
        sources.push({
          name: baseLabel,
          value: this.system[attr].base,
        });
      }
      if (attr === "morale") {
        sources.push({
          name: game.i18n.localize("PF1KS.Army.Commander"),
          value: this.system.morale.commander,
        });
      }
      if (attr === "speed") {
        sources.push({
          name: baseLabel,
          value: game.i18n.format("PF1.SetTo", { value: this.system.speed.base }),
        });
      }
    }

    if (path === "system.tactics.max.total") {
      sources.push({
        name: baseLabel,
        value: this.system.tactics.max.base,
      });
    }

    return sources;
  }

  prepareConditions() {
    this.system.conditions = {};
    const conditions = this.system.conditions;

    for (const condition of Object.keys(pf1ks.config.armyConditions)) {
      conditions[condition] = this.statuses.has(condition);
    }
  }
}
