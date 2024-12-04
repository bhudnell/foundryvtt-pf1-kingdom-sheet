import { kingdomBuffTargets, commonBuffTargets } from "../../config/buffTargets.mjs";
import {
  alignmentEffects,
  CFG,
  edictEffects,
  kingdomStats,
  leadershipBonusToKingdomStats,
  leadershipPenalties,
} from "../../config/config.mjs";
import { DefaultChange } from "../../util/utils.mjs";

import { BaseActor } from "./baseActor.mjs";

export class KingdomActor extends BaseActor {
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
    for (const stat of Object.keys(kingdomStats)) {
      // alignment
      changes.push(
        new DefaultChange(
          alignmentEffects[system.alignment]?.[stat] ?? 0,
          `${CFG.changePrefix}_${stat}`,
          "PF1KS.Alignment"
        ),

        // edicts
        new DefaultChange(
          edictEffects.holiday[system.edicts.holiday]?.[stat] ?? 0,
          `${CFG.changePrefix}_${stat}`,
          "PF1KS.Edicts.Holiday"
        ),
        new DefaultChange(
          edictEffects.promotion[system.edicts.promotion]?.[stat] ?? 0,
          `${CFG.changePrefix}_${stat}`,
          "PF1KS.Edicts.Promotion"
        ),
        new DefaultChange(
          edictEffects.taxation[system.edicts.taxation]?.[stat] ?? 0,
          `${CFG.changePrefix}_${stat}`,
          "PF1KS.Edicts.Taxation"
        ),

        // leadership
        ...filledRoles.map(
          (leader) =>
            new DefaultChange(
              leadershipBonusToKingdomStats[leader.bonusType]?.includes(stat) ? leader.bonus : 0,
              `${CFG.changePrefix}_${stat}`,
              leader.role
            )
        ),
        ...vacantRoles.map(
          (leader) =>
            new DefaultChange(
              -(leadershipPenalties[leader.role][stat] ?? 0),
              `${CFG.changePrefix}_${stat}`,
              `${leader.role} (Vacant)` // todo i18n-ify
            )
        ),

        // unrest
        new DefaultChange(-system.unrest, `${CFG.changePrefix}_${stat}`, "PF1KS.Unrest")
      );

      if (system.settings.optionalRules.leadershipSkills) {
        changes.push(
          ...filledRoles.map(
            (leader) =>
              new DefaultChange(
                leadershipBonusToKingdomStats[leader.bonusType]?.includes(stat) ? leader.skillBonus : 0,
                `${CFG.changePrefix}_${stat}`,
                `${leader.role} (Skill Bonus)` // todo i18n-ify
              )
          )
        );
      }
    }

    // consumption
    changes.push(
      new DefaultChange(system.size, `${CFG.changePrefix}_consumption`, "PF1KS.Size"),
      new DefaultChange(system.totalDistricts, `${CFG.changePrefix}_consumption`, "PF1KS.Districts"),
      new DefaultChange(
        edictEffects.holiday[system.edicts.holiday]?.consumption ?? 0,
        `${CFG.changePrefix}_consumption`,
        "PF1KS.Edicts.Holiday"
      ),
      new DefaultChange(
        edictEffects.promotion[system.edicts.promotion]?.consumption ?? 0,
        `${CFG.changePrefix}_consumption`,
        "PF1KS.Edicts.Promotion"
      )
    );

    // TODO more
  }

  _setSourceDetails() {
    const sourceDetails = {};
    // Get empty source arrays
    for (const b of Object.keys({ ...kingdomBuffTargets, ...commonBuffTargets })) {
      const buffTargets = pf1.documents.actor.changes.getChangeFlat.call(this, b, null);
      for (const bt of buffTargets) {
        if (!sourceDetails[bt]) {
          sourceDetails[bt] = [];
        }
      }
    }

    // TODO
    // for (let attributeId of ["dv", "om", "consumption", "morale"]) {
    //   sourceDetails[`system.${attributeId}.total`].push({
    //     name: game.i18n.localize("PF1.Base"),
    //     value: this.system[attributeId].base,
    //   });
    // }
    // sourceDetails["system.morale.total"].push({
    //   name: game.i18n.localize("PF1KS.Army.Commander"),
    //   value: this.system.morale.commander,
    // });
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
}
