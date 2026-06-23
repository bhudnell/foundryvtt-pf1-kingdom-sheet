import { DefaultChange, asSignedPercent, capitalize } from "../../util/utils.mjs";

import { BaseActor } from "./baseActor.mjs";

export class KingdomActor extends BaseActor {
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
    const notes = await this.getContextNotesParsed(`${pf1ks.config.changePrefix}_${kingdomStatId}`, { rollData });
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
            "PF1KS.LeadershipLabel"
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

    // kingdom modifiers
    if (this.system.settings.optionalRules.kingdomModifiers) {
      for (const modifier of Object.keys(pf1ks.config.settlementModifiers)) {
        const alignment = pf1ks.config.alignmentEffects[this.system.alignment]?.[modifier] ?? 0;
        if (alignment) {
          changes.push(new DefaultChange(alignment, `${pf1ks.config.changePrefix}_${modifier}`, "PF1.Alignment"));
        }

        const government = pf1ks.config.kingdomGovernmentBonuses[this.system.government]?.[modifier] ?? 0;
        if (government) {
          changes.push(
            new DefaultChange(government, `${pf1ks.config.changePrefix}_${modifier}`, "PF1KS.GovernmentLabel")
          );
        }

        const settlements = Math.floor(
          this.system.settlementProxies.reduce(
            (acc, curr) => acc + (curr.actor?.system?.modifiers?.[modifier].settlementTotal ?? 0),
            0
          ) / 10
        );
        if (settlements) {
          changes.push(new DefaultChange(settlements, `${pf1ks.config.changePrefix}_${modifier}`, "PF1KS.Settlements"));
        }
      }
    }

    // fame/infamy
    const { fameBonus, infamyBonus } = system.settlementProxies.reduce(
      (acc, proxy) => {
        acc.fameBonus +=
          (proxy.actor.system.modifiers?.lore.settlementTotal ?? 0) +
          (proxy.actor.system.modifiers?.society.settlementTotal ?? 0);
        acc.infamyBonus +=
          (proxy.actor.system.modifiers?.corruption.settlementTotal ?? 0) +
          (proxy.actor.system.modifiers?.crime.settlementTotal ?? 0);
        return acc;
      },
      { fameBonus: 0, infamyBonus: 0 }
    );
    if (fameBonus) {
      changes.push(
        new DefaultChange(Math.floor(fameBonus / 10), `${pf1ks.config.changePrefix}_fame`, "PF1KS.SettlementModifiers")
      );
    }
    if (infamyBonus) {
      changes.push(
        new DefaultChange(
          Math.floor(infamyBonus / 10),
          `${pf1ks.config.changePrefix}_infamy`,
          "PF1KS.SettlementModifiers"
        )
      );
    }

    // settlements
    if (system.settings.collapseTooltips) {
      for (const stat of Object.keys(pf1ks.config.settlementKingdomStats)) {
        const value = system.settlementProxies.reduce(
          (acc, proxy) => acc + (proxy.actor.system.kingdomStats?.[stat] ?? 0),
          0
        );
        if (value) {
          changes.push(new DefaultChange(value, `${pf1ks.config.changePrefix}_${stat}`, "PF1KS.Settlements"));
        }
      }
    } else {
      for (const settlementProxy of system.settlementProxies) {
        for (const [key, value] of Object.entries(settlementProxy.actor.system.kingdomStats ?? {})) {
          if (value) {
            changes.push(new DefaultChange(value, `${pf1ks.config.changePrefix}_${key}`, settlementProxy.actor.name));
          }
        }
      }
    }

    // armies
    const armyConsumption = this.system.armies.reduce((acc, proxy) => acc + proxy.actor.system.consumption.total, 0);
    if (armyConsumption) {
      changes.push(new DefaultChange(armyConsumption, `${pf1ks.config.changePrefix}_consumption`, "PF1KS.Armies"));
    }
  }

  getSourceDetails(path) {
    const sources = [];

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
    }

    sources.push(...super.getSourceDetails(path));

    return sources;
  }

  prepareConditions() {
    this.system.conditions = {};
  }
}
