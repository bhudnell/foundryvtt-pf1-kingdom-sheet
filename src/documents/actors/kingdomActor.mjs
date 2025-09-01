import { kingdomBuffTargets, commonBuffTargets } from "../../config/buffTargets.mjs";
import { DefaultChange } from "../../util/utils.mjs";

import { BaseActor } from "./baseActor.mjs";

export class KingdomActor extends BaseActor {
  prepareDerivedData() {
    super.prepareDerivedData();

    for (const settlement of this.system.settlements) {
      // magic items
      for (const key of Object.keys(pf1ks.config.magicItemTypes)) {
        const count = this._getChanges(key, undefined, settlement.id);
        const oldItems = settlement.magicItems[key];
        settlement.magicItems[key] = oldItems.concat(Array(Math.max(count - oldItems.length, 0)).fill(null));
      }

      // the below is split between here and settlementModel.mjs prepareDerivedData because of the change system.
      // size, alignment, and government are handled in settlementModel.mjs and everything else is handled here

      // settlement attributes (danger, baseValue, maxBaseValue, spellcasting, purchaseLimit)
      for (const attr of Object.keys(pf1ks.config.settlementAttributes)) {
        const { size, government } = settlement.attributes[attr];
        const buildings = this._getChanges(attr, pf1ks.config.buildingId, settlement.id);
        const improvements = this._getChanges(attr, pf1ks.config.improvementId, settlement.id);
        const events = this._getChanges(attr, pf1ks.config.eventId, settlement.id);
        // TODO settlement feature items

        const total = (size ?? 0) + (government ?? 0) + buildings + improvements + events;

        // TODO what to do when baseValue is greater than maxBaseValue

        settlement.attributes[attr] = {
          ...settlement.attributes[attr],
          buildings,
          improvements,
          events,
          total,
        };
      }

      // settlement modifiers
      for (const modifier of Object.keys(pf1ks.config.settlementModifiers)) {
        const { size, kingdomAlignment, kingdomGovernment, settlementAlignment, settlementGovernment } =
          settlement.modifiers[modifier];
        const buildings = this._getChanges(modifier, pf1ks.config.buildingId, settlement.id);
        const improvements = this._getChanges(modifier, pf1ks.config.improvementId, settlement.id);
        const events = this._getChanges(modifier, pf1ks.config.eventId, settlement.id);
        // TODO settlement feature items

        let settlementTotal =
          size +
          kingdomAlignment +
          kingdomGovernment +
          settlementAlignment +
          settlementGovernment +
          buildings +
          improvements +
          events;

        settlement.modifiers[modifier] = {
          ...settlement.modifiers[modifier],
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
        const government = pf1ks.config.kingdomGovernmentBonuses[this.system.government]?.[modifier] ?? 0;

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

    // fame/infamy
    this.system.fame.total += Math.floor(this._getChanges("lore") / 10) + Math.floor(this._getChanges("society") / 10);
    this.system.infamy.total +=
      Math.floor(this._getChanges("corruption") / 10) + Math.floor(this._getChanges("crime") / 10);

    // deleting this because it only exists to get settlement modifier changes to parse
    delete this.system.someFakeData;
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
    const notes = await this.getContextNotesParsed(`${pf1ks.config.changePrefix}_${kingdomStatId}`, null, { rollData });
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
      details: await roll.getTooltip(),
      eventOccurred,
    };

    const messageData = {
      type: "check",
      style: CONST.CHAT_MESSAGE_STYLES.OTHER,
      rolls: [roll],
      sound: options.noSound ? undefined : CONFIG.sounds.dice,
      content: await renderTemplate(`modules/${pf1ks.config.moduleId}/templates/chat/event-roll.hbs`, templateData),
      speaker: ChatMessage.getSpeaker({ actor, token, alias: token?.name }),
      flags: { [pf1ks.config.moduleId]: { eventChanceCard: true } },
    };

    await ChatMessage.create(messageData);
  }

  _prepareTypeChanges(changes) {
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
      changes.push(
        // alignment
        new DefaultChange(
          pf1ks.config.alignmentEffects[system.alignment]?.[stat] ?? 0,
          `${pf1ks.config.changePrefix}_${stat}`,
          "PF1.Alignment"
        ),
        // unrest
        new DefaultChange(-system.unrest, `${pf1ks.config.changePrefix}_${stat}`, "PF1KS.Unrest")
      );

      // leadership
      if (system.settings.collapseTooltips) {
        changes.push(
          new DefaultChange(
            filledRoles.reduce(
              (acc, leader) =>
                (acc += pf1ks.config.leadershipBonusToKingdomStats[leader.bonusType]?.includes(stat)
                  ? leader.bonus
                  : 0),
              0
            ),
            `${pf1ks.config.changePrefix}_${stat}`,
            game.i18n.localize("PF1KS.LeadershipLabel")
          ),
          new DefaultChange(
            -vacantRoles.reduce((acc, leader) => (acc += pf1ks.config.leadershipPenalties[leader.role][stat] ?? 0), 0),
            `${pf1ks.config.changePrefix}_${stat}`,
            game.i18n.format("PF1KS.LeaderVacant", { value: game.i18n.localize("PF1KS.LeadershipLabel") })
          )
        );

        if (system.settings.optionalRules.leadershipSkills) {
          changes.push(
            new DefaultChange(
              filledRoles.reduce(
                (acc, leader) =>
                  (acc += pf1ks.config.leadershipBonusToKingdomStats[leader.bonusType]?.includes(stat)
                    ? leader.skillBonus
                    : 0),
                0
              ),
              `${pf1ks.config.changePrefix}_${stat}`,
              game.i18n.format("PF1KS.LeaderSkillBonus", { value: game.i18n.localize("PF1KS.LeadershipLabel") })
            )
          );
        }
      } else {
        changes.push(
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
          )
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
    }

    // edicts
    changes.push(
      new DefaultChange(
        pf1ks.config.edictEffects.holiday[system.edicts.holiday]?.loyalty ?? 0,
        `${pf1ks.config.changePrefix}_loyalty`,
        game.i18n.format("PF1KS.Edict.HolidayChange", { value: pf1ks.config.edicts.holiday[system.edicts.holiday] })
      ),
      new DefaultChange(
        pf1ks.config.edictEffects.holiday[system.edicts.holiday]?.consumption ?? 0,
        `${pf1ks.config.changePrefix}_consumption`,
        game.i18n.format("PF1KS.Edict.HolidayChange", { value: pf1ks.config.edicts.holiday[system.edicts.holiday] })
      ),
      new DefaultChange(
        pf1ks.config.edictEffects.promotion[system.edicts.promotion]?.stability ?? 0,
        `${pf1ks.config.changePrefix}_stability`,
        game.i18n.format("PF1KS.Edict.PromotionChange", {
          value: pf1ks.config.edicts.promotion[system.edicts.promotion],
        })
      ),
      new DefaultChange(
        pf1ks.config.edictEffects.taxation[system.edicts.taxation]?.economy ?? 0,
        `${pf1ks.config.changePrefix}_economy`,
        game.i18n.format("PF1KS.Edict.TaxationChange", {
          value: pf1ks.config.edicts.taxation[system.edicts.taxation],
        })
      )
    );
    const hasCathedral = this.itemTypes[pf1ks.config.buildingId].some((building) => building.type === "cathedral");
    const promotionConsumption = pf1ks.config.edictEffects.promotion[system.edicts.promotion]?.consumption ?? 0;
    changes.push(
      new DefaultChange(
        hasCathedral ? Math.floor(promotionConsumption / 2) : promotionConsumption,
        `${pf1ks.config.changePrefix}_consumption`,
        game.i18n.format("PF1KS.Edict.PromotionChange", {
          value: pf1ks.config.edicts.promotion[system.edicts.promotion],
        })
      )
    );
    const hasWaterfront = this.itemTypes[pf1ks.config.buildingId].some((building) => building.type === "waterfront");
    const taxationLoyalty = pf1ks.config.edictEffects.taxation[system.edicts.taxation]?.loyalty ?? 0;
    changes.push(
      new DefaultChange(
        hasWaterfront ? Math.floor(taxationLoyalty / 2) : taxationLoyalty,
        `${pf1ks.config.changePrefix}_loyalty`,
        game.i18n.format("PF1KS.Edict.TaxationChange", {
          value: pf1ks.config.edicts.taxation[system.edicts.taxation],
        })
      )
    );
  }

  getSourceDetails(path) {
    const sources = super.getSourceDetails(path);

    const baseLabel = game.i18n.localize("PF1.Base");

    // control DC
    if (path === "system.controlDC") {
      sources.push(
        {
          name: baseLabel,
          value: game.i18n.format("PF1.SetTo", { value: 20 }),
        },
        {
          name: game.i18n.localize("PF1.Size"),
          value: this.system.size,
        },
        {
          name: game.i18n.localize("PF1KS.Districts"),
          value: this.system.totalDistricts,
        }
      );
    }

    // kingdom modifiers
    const kModRE = /^system\.modifiers\.(?<mod>\w+)\.total$/.exec(path);
    if (kModRE) {
      const { mod } = kModRE.groups;

      if (this.system.modifiers[mod].alignment) {
        sources.push({
          name: game.i18n.localize("PF1.Alignment"),
          value: this.system.modifiers[mod].alignment,
        });
      }
      if (this.system.modifiers[mod].government) {
        sources.push({
          name: game.i18n.localize("PF1KS.GovernmentLabel"),
          value: this.system.modifiers[mod].government,
        });
      }
      if (this.system.modifiers[mod].allSettlements) {
        sources.push({
          name: game.i18n.localize("PF1KS.Settlements"),
          value: this.system.modifiers[mod].allSettlements,
        });
      }
    }

    // consumption
    if (path === "system.consumption.total") {
      sources.push(
        {
          name: game.i18n.localize("PF1.Size"),
          value: this.system.size,
        },
        {
          name: game.i18n.localize("PF1KS.Districts"),
          value: this.system.totalDistricts,
        }
      );
    }

    // fame/infamy
    if (["system.fame.total", "system.infamy.total"].includes(path)) {
      const fameInfamyRE = /^system\.(?<key>\w+)\.total$/.exec(path);
      const { key } = fameInfamyRE.groups;

      if (this.system[key].base) {
        sources.push({
          name: baseLabel,
          value: this.system[key].base,
        });
      }

      if (key === "fame") {
        const lore = Math.floor(this._getChanges("lore") / 10);
        const society = Math.floor(this._getChanges("society") / 10);

        if (lore) {
          sources.push({
            name: game.i18n.localize("PF1KS.Lore"),
            value: lore,
          });
        }
        if (society) {
          sources.push({
            name: game.i18n.localize("PF1KS.Society"),
            value: society,
          });
        }
      }

      if (key === "infamy") {
        const corruption = Math.floor(this._getChanges("corruption") / 10);
        const crime = Math.floor(this._getChanges("crime") / 10);

        if (corruption) {
          sources.push({
            name: game.i18n.localize("PF1KS.Corruption"),
            value: corruption,
          });
        }
        if (crime) {
          sources.push({
            name: game.i18n.localize("PF1KS.Crime"),
            value: crime,
          });
        }
      }
    }

    // settlement stuff
    const settlementRE = /^system\.settlements\.(?<idx>\w+)\.(?<detail>.+)$/.exec(path);
    if (settlementRE) {
      const { idx, detail } = settlementRE.groups;
      const s = this.system.settlements[idx];

      // attributes
      const sAttrRE = /^attributes\.(?<attr>\w+)\.total$/.exec(detail);
      if (sAttrRE) {
        const { attr } = sAttrRE.groups;

        if (s.attributes[attr].size) {
          sources.push({
            name: game.i18n.localize("PF1.Size"),
            value: s.attributes[attr].size,
          });
        }
        if (s.attributes[attr].government) {
          sources.push({
            name: game.i18n.localize("PF1KS.GovernmentLabel"),
            value: s.attributes[attr].government,
          });
        }
        if (s.attributes[attr].buildings) {
          sources.push({
            name: game.i18n.localize("PF1KS.Buildings"),
            value: s.attributes[attr].buildings,
          });
        }
        if (s.attributes[attr].improvements) {
          sources.push({
            name: game.i18n.localize("PF1KS.Improvements"),
            value: s.attributes[attr].improvements,
          });
        }
        if (s.attributes[attr].events) {
          sources.push({
            name: game.i18n.localize("PF1KS.Events"),
            value: s.attributes[attr].events,
          });
        }
      }

      // modifiers
      const sModRE = /^modifiers\.(?<mod>\w+)\.total$/.exec(detail);
      if (sModRE) {
        const { mod } = sModRE.groups;

        if (s.modifiers[mod].size) {
          sources.push({
            name: game.i18n.localize("PF1.Size"),
            value: s.modifiers[mod].size,
          });
        }
        if (s.modifiers[mod].kingdomAlignment) {
          sources.push({
            name: game.i18n.localize("PF1KS.KingdomAlignment"),
            value: s.modifiers[mod].kingdomAlignment,
          });
        }
        if (s.modifiers[mod].kingdomGovernment) {
          sources.push({
            name: game.i18n.localize("PF1KS.KingdomGovernment"),
            value: s.modifiers[mod].kingdomGovernment,
          });
        }
        if (s.modifiers[mod].settlementAlignment) {
          sources.push({
            name: game.i18n.localize("PF1KS.SettlementAlignment"),
            value: s.modifiers[mod].settlementAlignment,
          });
        }
        if (s.modifiers[mod].settlementGovernment) {
          sources.push({
            name: game.i18n.localize("PF1KS.SettlementGovernment"),
            value: s.modifiers[mod].settlementGovernment,
          });
        }
        if (s.modifiers[mod].buildings) {
          sources.push({
            name: game.i18n.localize("PF1KS.Buildings"),
            value: s.modifiers[mod].buildings,
          });
        }
        if (s.modifiers[mod].improvements) {
          sources.push({
            name: game.i18n.localize("PF1KS.Improvements"),
            value: s.modifiers[mod].improvements,
          });
        }
        if (s.modifiers[mod].events) {
          sources.push({
            name: game.i18n.localize("PF1KS.Events"),
            value: s.modifiers[mod].events,
          });
        }
        if (s.modifiers[mod].total > s.modifiers[mod].settlementTotal) {
          sources.push({
            name: game.i18n.localize("PF1KS.KingdomModifier"),
            value: game.i18n.format("PF1.SetTo", { value: s.modifiers[mod].total }),
          });
        }
      }
    }

    return sources;
  }

  _getChanges(target, type, settlementId) {
    if (!this.changes) {
      return 0;
    }

    return this.changes
      .filter((c) => {
        const changeTarget = c.target.split("_").pop();
        if (changeTarget !== target) {
          return false;
        }
        if (type && c.parent.type !== type) {
          return false;
        }
        if (
          settlementId &&
          [
            ...Object.keys(pf1ks.config.settlementModifiers),
            ...Object.keys(pf1ks.config.settlementAttributes),
            ...Object.keys(pf1ks.config.magicItemTypes),
          ].includes(changeTarget) &&
          c.parent.system.settlementId !== settlementId // TODO it needs a district assigned as well
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
