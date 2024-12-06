import { kingdomBuffTargets, commonBuffTargets } from "../../config/buffTargets.mjs";
import { DefaultChange } from "../../util/utils.mjs";

import { BaseActor } from "./baseActor.mjs";

export class KingdomActor extends BaseActor {
  async rollKingdomStat(kingdomStatId, options = {}) {
    const parts = [];

    const changes = pf1.documents.actor.changes.getHighestChanges(
      this.changes.filter(
        (c) => c.operator !== "set" && c.target === `${pf1ks.config.changePrefix}_${kingdomStatId}` && c.value
      ),
      { ignoreTarget: true }
    );

    for (const c of changes) {
      parts.push(`${c.value * (c.parent?.system.quantity ?? 1)}[${c.flavor}]`);
    }

    const label = pf1ks.config.kingdomStats[kingdomStatId];
    const actor = options.actor ?? this;
    const token = options.token ?? this.token;

    const rollOptions = {
      ...options,
      parts,
      flavor: game.i18n.format("PF1KS.KingdomStatRoll", { check: label }),
      speaker: ChatMessage.getSpeaker({ actor, token, alias: token?.name }),
    };

    return await pf1.dice.d20Roll(rollOptions);
  }

  async rollEvent(options = {}) {
    const roll = new pf1.dice.RollPF("1d100");

    await roll.evaluate();

    const eventChance = this.system.eventLastTurn ? 25 : 75;

    const eventOccurred = roll.total <= eventChance;

    const actor = options.actor ?? this;
    const token = options.token ?? this.token;

    const templateData = {
      label: game.i18n.format("PF1KS.EventChanceRoll", { chance: eventChance }),
      formula: roll.formula,
      natural: roll.total,
      bonus: 0,
      total: roll.total,
      tooltip: await roll.getTooltip(),
      eventOccurred,
    };

    const messageData = {
      type: CONST.CHAT_MESSAGE_TYPES.ROLL,
      sound: options.noSound ? undefined : CONFIG.sounds.dice,
      content: await renderTemplate(`modules/${pf1ks.config.moduleId}/templates/chat/event-roll.hbs`, templateData),
      speaker: ChatMessage.getSpeaker({ actor, token, alias: token?.name }),
      flags: { [pf1ks.config.moduleId]: { eventChanceCard: true } },
    };

    await ChatMessage.create(messageData);
  }

  // todo see if using @variables works too also on armyactor
  _addDefaultChanges(changes) {
    const system = this.system;

    // kingdom stats
    const filledRoles = [];
    const vacantRoles = [];
    for (const leader of Object.values(system.leadership).flatMap((v) => v)) {
      if (leader.vacant) {
        vacantRoles.push(leader);
      } else {
        filledRoles.push(leader);
      }
    }
    for (const stat of Object.keys(pf1ks.config.kingdomStats)) {
      // alignment
      changes.push(
        new DefaultChange(
          pf1ks.config.alignmentEffects[system.alignment]?.[stat] ?? 0,
          `${pf1ks.config.changePrefix}_${stat}`,
          "PF1.Alignment"
        ),

        // edicts
        new DefaultChange(
          pf1ks.config.edictEffects.holiday[system.edicts.holiday]?.[stat] ?? 0,
          `${pf1ks.config.changePrefix}_${stat}`,
          game.i18n.format("PF1KS.Edict.HolidayChange", { value: pf1ks.config.edicts.holiday[system.edicts.holiday] })
        ),
        new DefaultChange(
          pf1ks.config.edictEffects.promotion[system.edicts.promotion]?.[stat] ?? 0,
          `${pf1ks.config.changePrefix}_${stat}`,
          game.i18n.format("PF1KS.Edict.PromotionChange", {
            value: pf1ks.config.edicts.promotion[system.edicts.promotion],
          })
        ),
        new DefaultChange(
          pf1ks.config.edictEffects.taxation[system.edicts.taxation]?.[stat] ?? 0,
          `${pf1ks.config.changePrefix}_${stat}`,
          game.i18n.format("PF1KS.Edict.TaxationChange", {
            value: pf1ks.config.edicts.taxation[system.edicts.taxation],
          })
        ),

        // leadership
        ...filledRoles.map(
          (leader) =>
            new DefaultChange(
              pf1ks.config.leadershipBonusToKingdomStats[leader.bonusType]?.includes(stat) ? leader.bonus : 0,
              `${pf1ks.config.changePrefix}_${stat}`,
              pf1ks.config.leadershipRoles[leader.role]
            )
        ),
        ...vacantRoles.map(
          (leader) =>
            new DefaultChange(
              -(pf1ks.config.leadershipPenalties[leader.role][stat] ?? 0),
              `${pf1ks.config.changePrefix}_${stat}`,
              game.i18n.format("PF1KS.LeaderVacant", { value: pf1ks.config.leadershipRoles[leader.role] })
            )
        ),

        // unrest
        new DefaultChange(-system.unrest, `${pf1ks.config.changePrefix}_${stat}`, "PF1KS.Unrest")
      );

      if (system.settings.optionalRules.leadershipSkills) {
        changes.push(
          ...filledRoles.map(
            (leader) =>
              new DefaultChange(
                pf1ks.config.leadershipBonusToKingdomStats[leader.bonusType]?.includes(stat) ? leader.skillBonus : 0,
                `${pf1ks.config.changePrefix}_${stat}`,
                game.i18n.format("PF1KS.LeaderSkillBonus", { value: pf1ks.config.leadershipRoles[leader.role] })
              )
          )
        );
      }
    }

    // consumption
    changes.push(
      new DefaultChange(system.size, `${pf1ks.config.changePrefix}_consumption`, "PF1KS.Size"),
      new DefaultChange(system.totalDistricts, `${pf1ks.config.changePrefix}_consumption`, "PF1KS.Districts"),
      new DefaultChange(
        pf1ks.config.edictEffects.holiday[system.edicts.holiday]?.consumption ?? 0,
        `${pf1ks.config.changePrefix}_consumption`,
        game.i18n.format("PF1KS.Edict.HolidayChange", { value: pf1ks.config.edicts.holiday[system.edicts.holiday] })
      ),
      new DefaultChange(
        pf1ks.config.edictEffects.promotion[system.edicts.promotion]?.consumption ?? 0,
        `${pf1ks.config.changePrefix}_consumption`,
        game.i18n.format("PF1KS.Edict.PromotionChange", {
          value: pf1ks.config.edicts.promotion[system.edicts.promotion],
        })
      )
    );

    // fame/infamy
    changes.push(
      new DefaultChange(Math.floor(this._getChanges("lore") / 10), `${pf1ks.config.changePrefix}_fame`, "PF1KS.Lore"),
      new DefaultChange(
        Math.floor(this._getChanges("society") / 10),
        `${pf1ks.config.changePrefix}_fame`,
        "PF1KS.Society"
      ),
      new DefaultChange(
        Math.floor(this._getChanges("corruption") / 10),
        `${pf1ks.config.changePrefix}_infamy`,
        "PF1KS.Corruption"
      ),
      new DefaultChange(
        Math.floor(this._getChanges("crime") / 10),
        `${pf1ks.config.changePrefix}_infamy`,
        "PF1KS.Crime"
      )
    );

    // TODO more?
  }

  _setSourceDetails() {
    const sourceDetails = { "system.controlDC": [] };
    // Get empty source arrays
    for (const b of Object.keys({ ...kingdomBuffTargets, ...commonBuffTargets })) {
      const buffTargets = pf1.documents.actor.changes.getChangeFlat.call(this, b, null);
      for (const bt of buffTargets) {
        if (!sourceDetails[bt]) {
          sourceDetails[bt] = [];
        }
      }
    }

    // control DC
    sourceDetails["system.controlDC"].push(
      {
        name: game.i18n.localize("PF1.Base"),
        value: game.i18n.format("PF1.SetTo", { value: 20 }),
      },
      {
        name: game.i18n.localize("PF1KS.Size"),
        value: this.system.size,
      },
      {
        name: game.i18n.localize("PF1KS.Districts"),
        value: this.system.totalDistricts,
      }
    );

    // fame/infamy
    for (let attributeId of ["fame", "infamy"]) {
      if (this.system[attributeId].base) {
        sourceDetails[`system.${attributeId}.total`].push({
          name: game.i18n.localize("PF1.Base"),
          value: this.system[attributeId].base,
        });
      }
    }

    // TODO more?
    // sourceDetails["system.speed.total"].push({
    //   name: game.i18n.localize("PF1.Base"),
    //   value: game.i18n.format("PF1.SetTo", { value: this.system.speed.base }),
    // });
    // sourceDetails["system.tactics.max.total"].push({
    //   name: game.i18n.localize("PF1.Base"),
    //   value: this.system.tactics.max.base,
    // });

    // Add extra data
    const rollData = this.getRollData();
    for (const [path, changeGrp] of Object.entries(this.sourceInfo)) {
      /** @type {Array<SourceInfo[]>} */
      const sourceGroups = Object.values(changeGrp);
      for (const grp of sourceGroups) {
        sourceDetails[path] ||= [];
        for (const src of grp) {
          src.operator ||= "add";
          // TODO: Separate source name from item type label
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

  _getChanges(target, type) {
    return (
      this.changes
        ?.filter((c) => {
          if (c.target !== target) {
            return false;
          }
          if (type && c.parent.type !== type) {
            return false;
          }
          return true;
        })
        .reduce((total, c) => total + c.value * (c.parent.system.quantity ?? 1), 0) ?? 0
    );
  }
}
