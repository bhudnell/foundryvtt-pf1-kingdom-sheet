import { kingdomBuffTargets, commonBuffTargets } from "../../config/buffTargets.mjs";
import { DefaultChange } from "../../util/utils.mjs";

import { BaseActor } from "./baseActor.mjs";

export class KingdomActor extends BaseActor {
  prepareDerivedData() {
    super.prepareDerivedData();

    // settlement modifiers
    // this is split between here and settlementModel.mjs because of the change system.
    // size, alignment, and government are handled in settlementModel.mjs and item changes and the totals are handled here
    for (const settlement of this.system.settlements) {
      for (const modifier of Object.keys(pf1ks.config.allSettlementModifiers)) {
        const { size, alignment, government } = settlement.modifiers[modifier];
        const buildings = this._getChanges(modifier, pf1ks.config.buildingId, settlement.id);
        const improvements = this._getChanges(modifier, pf1ks.config.improvementId, settlement.id);
        const events = this._getChanges(modifier, pf1ks.config.eventId, settlement.id);

        let settlementTotal = size + alignment + government + buildings + improvements + events;

        if (modifier === "baseValue") {
          settlementTotal = Math.min(
            settlementTotal,
            this.system.settings.optionalRules.altSettlementSizes
              ? pf1ks.config.altSettlementValues[settlement.size].maxBaseValue
              : pf1ks.config.settlementValues[settlement.size].maxBaseValue
          );
        }

        settlement.modifiers[modifier] = {
          size,
          alignment,
          government,
          buildings,
          improvements,
          events,
          settlementTotal,
          total: settlementTotal,
        };
      }
    }

    // kingdom modifiers
    if (this.system.settings.optionalRules.kingdomModifiers) {
      for (const modifier of Object.keys(pf1ks.config.settlementModifiers)) {
        const allSettlements = Math.floor(
          this.system.settlements.reduce((acc, curr) => acc + curr.modifiers[modifier].settlementTotal, 0) / 10
        );
        const alignment = pf1ks.config.alignmentEffects[this.system.alignment]?.[modifier] ?? 0;
        const government = pf1ks.config.governmentBonuses[this.system.government]?.[modifier] ?? 0;

        const total = allSettlements + alignment + government;

        this.system.modifiers[modifier] = {
          allSettlements,
          alignment,
          government,
          total,
        };
      }
    }

    // take higher of settlement modifiers and kingdom modifiers
    if (this.system.settings.optionalRules.kingdomModifiers) {
      for (const settlement of this.system.settlements) {
        for (const modifier of Object.keys(pf1ks.config.settlementModifiers)) {
          settlement.modifiers[modifier].total = Math.max(
            settlement.modifiers[modifier].total,
            this.system.modifiers[modifier].total
          );
        }
      }
    }

    // deleting this because it only exists to get settlement modifier changes to parse
    delete this.system.someFakeData;

    this._setSourceDetails();
  }

  async rollKingdomStat(kingdomStatId, options = {}) {
    const parts = [];
    const props = [];

    const changes = pf1.documents.actor.changes.getHighestChanges(
      this.changes.filter(
        (c) => c.operator !== "set" && c.target === `${pf1ks.config.changePrefix}_${kingdomStatId}` && c.value
      ),
      { ignoreTarget: true }
    );

    for (const c of changes) {
      parts.push(`${c.value}[${c.flavor}]`);
    }

    // Add context notes
    const rollData = options.rollData || this.getRollData();
    const noteObjects = this.getContextNotes(`${pf1ks.config.changePrefix}_${kingdomStatId}`);
    const notes = this.formatContextNotes(noteObjects, rollData);
    if (notes.length > 0) {
      props.push({ header: game.i18n.localize("PF1.Notes"), value: notes });
    }

    const label = pf1ks.config.kingdomStats[kingdomStatId];
    const actor = options.actor ?? this;
    const token = options.token ?? this.token;

    const rollOptions = {
      ...options,
      parts,
      rollData,
      flavor: game.i18n.format("PF1KS.KingdomStatRoll", { check: label }),
      chatTemplateData: { properties: props },
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
  }

  _setSourceDetails() {
    // Get empty source arrays
    const sourceDetails = {};
    for (const b of Object.keys({ ...kingdomBuffTargets, ...commonBuffTargets })) {
      const buffTargets = pf1.documents.actor.changes.getChangeFlat.call(this, b, null);
      for (const bt of buffTargets) {
        if (!sourceDetails[bt]) {
          sourceDetails[bt] = [];
        }
      }
    }

    // control DC
    sourceDetails["system.controlDC"] = [
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
      },
    ];

    // kingdom modifiers
    Object.keys(pf1ks.config.settlementModifiers).forEach((mod) => {
      sourceDetails[`system.modifiers.${mod}.total`] = [];
      if (this.system.modifiers[mod].alignment) {
        sourceDetails[`system.modifiers.${mod}.total`].push({
          name: game.i18n.localize("PF1.Alignment"),
          value: this.system.modifiers[mod].alignment,
        });
      }
      if (this.system.modifiers[mod].government) {
        sourceDetails[`system.modifiers.${mod}.total`].push({
          name: game.i18n.localize("PF1KS.GovernmentLabel"),
          value: this.system.modifiers[mod].government,
        });
      }
      if (this.system.modifiers[mod].allSettlements) {
        sourceDetails[`system.modifiers.${mod}.total`].push({
          name: game.i18n.localize("PF1KS.Settlements"),
          value: this.system.modifiers[mod].allSettlements,
        });
      }
    });

    // fame/infamy
    for (let attributeId of ["fame", "infamy"]) {
      if (this.system[attributeId].base) {
        sourceDetails[`system.${attributeId}.total`].push({
          name: game.i18n.localize("PF1.Base"),
          value: this.system[attributeId].base,
        });
      }
    }

    // settlement stuff
    this.system.settlements.forEach((s, idx) => {
      // danger
      sourceDetails[`system.settlements.${idx}.danger`] = [];
      if (s.danger) {
        sourceDetails[`system.settlements.${idx}.danger`].push({
          name: game.i18n.localize("PF1.Base"),
          value: s.danger,
        });
      }
      // modifiers
      Object.keys(pf1ks.config.allSettlementModifiers).forEach((mod) => {
        sourceDetails[`system.settlements.${idx}.modifiers.${mod}.total`] = [];
        if (s.modifiers[mod].size) {
          sourceDetails[`system.settlements.${idx}.modifiers.${mod}.total`].push({
            name: game.i18n.localize("PF1KS.Settlement.Size"),
            value: s.modifiers[mod].size,
          });
        }
        if (s.modifiers[mod].alignment) {
          sourceDetails[`system.settlements.${idx}.modifiers.${mod}.total`].push({
            name: game.i18n.localize("PF1.Alignment"),
            value: s.modifiers[mod].alignment,
          });
        }
        if (s.modifiers[mod].government) {
          sourceDetails[`system.settlements.${idx}.modifiers.${mod}.total`].push({
            name: game.i18n.localize("PF1KS.GovernmentLabel"),
            value: s.modifiers[mod].government,
          });
        }
        if (s.modifiers[mod].buildings) {
          sourceDetails[`system.settlements.${idx}.modifiers.${mod}.total`].push({
            name: game.i18n.localize("PF1KS.Buildings"),
            value: s.modifiers[mod].buildings,
          });
        }
        if (s.modifiers[mod].improvements) {
          sourceDetails[`system.settlements.${idx}.modifiers.${mod}.total`].push({
            name: game.i18n.localize("PF1KS.Improvements"),
            value: s.modifiers[mod].improvements,
          });
        }
        if (s.modifiers[mod].events) {
          sourceDetails[`system.settlements.${idx}.modifiers.${mod}.total`].push({
            name: game.i18n.localize("PF1KS.Events"),
            value: s.modifiers[mod].events,
          });
        }
        if (s.modifiers[mod].total > s.modifiers[mod].settlementTotal) {
          sourceDetails[`system.settlements.${idx}.modifiers.${mod}.total`].push({
            name: game.i18n.localize("PF1KS.KingdomModifier"),
            value: game.i18n.format("PF1.SetTo", { value: s.modifiers[mod].total }),
          });
        }
      });
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

  _getChanges(target, type, settlementId) {
    if (!this.changes) {
      return 0;
    }

    return this.changes
      .filter((c) => {
        const changeTarget = c.target.split("_")[1];
        if (changeTarget !== target) {
          return false;
        }
        if (type && c.parent.type !== type) {
          return false;
        }
        if (
          settlementId &&
          Object.keys(pf1ks.config.allSettlementModifiers).includes(changeTarget) &&
          c.parent.system.settlementId !== settlementId
        ) {
          return false;
        }
        return true;
      })
      .reduce((total, c) => total + c.value, 0);
  }

  prepareConditions() {
    this.system.conditions = {};
  }
}
