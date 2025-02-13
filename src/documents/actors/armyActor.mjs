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
    const noteObjects = this.getContextNotes(`${pf1ks.config.changePrefix}_${attributeId}`);
    if (attributeId === "om") {
      noteObjects.push(...this.getContextNotes(`${pf1ks.config.changePrefix}_damage`));
    }
    const notes = this.formatContextNotes(noteObjects, rollData);
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

    return roll.toMessage(
      { ...messageData, speaker },
      { create: chatMessage, noSound, chatTemplate, chatTemplateData, compendium, subject, rollMode }
    );
  }

  _addDefaultChanges(changes) {
    const system = this.system;

    // strategy
    changes.push(
      new DefaultChange((system.strategy - 2) * -2, `${pf1ks.config.changePrefix}_dv`, "PF1KS.Army.StrategyLabel"),
      new DefaultChange((system.strategy - 2) * 2, `${pf1ks.config.changePrefix}_om`, "PF1KS.Army.StrategyLabel"),
      new DefaultChange((system.strategy - 2) * 3, `${pf1ks.config.changePrefix}_damage`, "PF1KS.Army.StrategyLabel")
    );

    // resources
    if (system.resources.impArmor) {
      changes.push(
        new DefaultChange(1, `${pf1ks.config.changePrefix}_dv`, "PF1KS.Army.Resources.ImpArmor"),
        new DefaultChange(
          Math.max(Math.floor(pf1ks.config.armyConsumptionScaling[system.size] ?? 1), 1),
          `${pf1ks.config.changePrefix}_consumption`,
          "PF1KS.Army.Resources.ImpArmor"
        )
      );
    }
    if (system.resources.magArmor) {
      changes.push(
        new DefaultChange(2, `${pf1ks.config.changePrefix}_dv`, "PF1KS.Army.Resources.MagArmor"),
        new DefaultChange(
          Math.max(Math.floor(2 * (pf1ks.config.armyConsumptionScaling[system.size] ?? 1)), 1),
          `${pf1ks.config.changePrefix}_consumption`,
          "PF1KS.Army.Resources.MagArmor"
        )
      );
    }
    if (system.resources.impWeapons) {
      changes.push(
        new DefaultChange(1, `${pf1ks.config.changePrefix}_om`, "PF1KS.Army.Resources.ImpWeapons"),
        new DefaultChange(
          Math.max(Math.floor(pf1ks.config.armyConsumptionScaling[system.size] ?? 1), 1),
          `${pf1ks.config.changePrefix}_consumption`,
          "PF1KS.Army.Resources.ImpWeapons"
        )
      );
    }
    if (system.resources.magWeapons) {
      changes.push(
        new DefaultChange(2, `${pf1ks.config.changePrefix}_om`, "PF1KS.Army.Resources.MagWeapons"),
        new DefaultChange(
          Math.max(Math.floor(2 * (pf1ks.config.armyConsumptionScaling[system.size] ?? 1)), 1),
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
          Math.max(Math.floor(pf1ks.config.armyConsumptionScaling[system.size] ?? 1), 1),
          `${pf1ks.config.changePrefix}_consumption`,
          "PF1KS.Army.Resources.Mounts"
        )
      );
    }
    if (system.resources.ranged) {
      changes.push(
        new DefaultChange(
          Math.max(Math.floor(pf1ks.config.armyConsumptionScaling[system.size] ?? 1), 1),
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

  _setSourceDetails() {
    const sourceDetails = {};
    // Get empty source arrays
    for (const b of Object.keys({ ...armyBuffTargets, ...commonBuffTargets })) {
      const buffTargets = pf1.documents.actor.changes.getChangeFlat.call(this, b, null);
      for (const bt of buffTargets) {
        if (!sourceDetails[bt]) {
          sourceDetails[bt] = [];
        }
      }
    }

    for (let attributeId of ["dv", "om", "consumption", "morale"]) {
      sourceDetails[`system.${attributeId}.total`].push({
        name: game.i18n.localize("PF1.Base"),
        value: this.system[attributeId].base,
      });
    }
    sourceDetails["system.morale.total"].push({
      name: game.i18n.localize("PF1KS.Army.Commander"),
      value: this.system.morale.commander,
    });
    sourceDetails["system.speed.total"].push({
      name: game.i18n.localize("PF1.Base"),
      value: game.i18n.format("PF1.SetTo", { value: this.system.speed.base }),
    });
    sourceDetails["system.tactics.max.total"].push({
      name: game.i18n.localize("PF1.Base"),
      value: this.system.tactics.max.base,
    });

    // Add extra data
    const rollData = this.getRollData();
    for (const [path, changeGrp] of Object.entries(this.sourceInfo)) {
      /** @type {Array<SourceInfo[]>} */
      const sourceGroups = Object.values(changeGrp);
      for (const grp of sourceGroups) {
        sourceDetails[path] ||= [];
        for (const src of grp) {
          src.operator ||= "add";
          const label = this.constructor._getSourceLabel(src);
          let srcValue =
            src.value ??
            pf1.dice.RollPF.safeRollAsync(src.formula || "0", rollData, [path, src, this], {
              suppressError: !this.isOwner,
            }).total;
          if (src.operator === "set") {
            let displayValue = srcValue;
            if (src.change?.isDistance) {
              displayValue = pf1.utils.convertDistance(displayValue)[0];
            }
            srcValue = game.i18n.format("PF1.SetTo", { value: displayValue });
          }

          // Add sources only if they actually add something else than zero
          if (!(src.operator === "add" && srcValue === 0) || src.ignoreNull === false) {
            sourceDetails[path].push({
              name: label.replace(/[[\]]/g, ""),
              modifier: src.modifier || "",
              value: srcValue,
            });
          }
        }
      }
    }

    this.sourceDetails = sourceDetails;
  }

  prepareConditions() {
    this.system.conditions = {};
    const conditions = this.system.conditions;

    for (const condition of Object.keys(pf1ks.config.armyConditions)) {
      conditions[condition] = false;
    }

    // Fill in actual state
    for (const status of this.statuses) {
      if (status in conditions) {
        conditions[status] = true;
      }
    }
  }
}
