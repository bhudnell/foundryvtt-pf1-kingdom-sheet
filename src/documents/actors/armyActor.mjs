import { armyBuffTargets, commonBuffTargets } from "../../config/buffTargets.mjs";
import { armyConsumptionScaling, CFG } from "../../config/config.mjs";
import { DefaultChange } from "../../util/utils.mjs";

import { BaseActor } from "./baseActor.mjs";

export class ArmyActor extends BaseActor {
  _prepareChanges() {
    const changes = [];

    this._addDefaultChanges(changes);

    this.changeItems = this.items.filter(
      (item) => item.type.startsWith(`${CFG.id}.`) && item.hasChanges && item.isActive
    );

    for (const i of this.changeItems) {
      changes.push(...i.changes);
    }

    const c = new Collection();
    for (const change of changes) {
      // Avoid ID conflicts
      const parentId = change.parent?.id ?? "Actor";
      const uniqueId = `${parentId}-${change._id}`;
      c.set(uniqueId, change);
    }
    this.changes = c;
  }

  // todo any more?
  _addDefaultChanges(changes) {
    const system = this.system;

    // strategy
    changes.push(
      new DefaultChange(system.strategy * -2, `${CFG.changePrefix}_dv`, "PF1KS.Army.StrategyLabel"),
      new DefaultChange(system.strategy * 2, `${CFG.changePrefix}_om`, "PF1KS.Army.StrategyLabel"),
      new DefaultChange(system.strategy * 3, `${CFG.changePrefix}_damage`, "PF1KS.Army.StrategyLabel")
    );

    // resources
    if (system.resources.impArmor) {
      changes.push(
        new DefaultChange(1, `${CFG.changePrefix}_dv`, "PF1KS.Army.Resources.ImpArmor"),
        new DefaultChange(
          Math.max(Math.floor(armyConsumptionScaling[system.size] ?? 1), 1),
          `${CFG.changePrefix}_consumption`,
          "PF1KS.Army.Resources.ImpArmor"
        )
      );
    }
    if (system.resources.magArmor) {
      changes.push(
        new DefaultChange(2, `${CFG.changePrefix}_dv`, "PF1KS.Army.Resources.MagArmor"),
        new DefaultChange(
          Math.max(Math.floor(2 * (armyConsumptionScaling[system.size] ?? 1)), 1),
          `${CFG.changePrefix}_consumption`,
          "PF1KS.Army.Resources.MagArmor"
        )
      );
    }
    if (system.resources.impWeapons) {
      changes.push(
        new DefaultChange(1, `${CFG.changePrefix}_om`, "PF1KS.Army.Resources.ImpWeapons"),
        new DefaultChange(
          Math.max(Math.floor(armyConsumptionScaling[system.size] ?? 1), 1),
          `${CFG.changePrefix}_consumption`,
          "PF1KS.Army.Resources.ImpWeapons"
        )
      );
    }
    if (system.resources.magWeapons) {
      changes.push(
        new DefaultChange(2, `${CFG.changePrefix}_om`, "PF1KS.Army.Resources.MagWeapons"),
        new DefaultChange(
          Math.max(Math.floor(2 * (armyConsumptionScaling[system.size] ?? 1)), 1),
          `${CFG.changePrefix}_consumption`,
          "PF1KS.Army.Resources.MagWeapons"
        )
      );
    }
    if (system.resources.mounts) {
      changes.push(
        new DefaultChange(2, `${CFG.changePrefix}_dv`, "PF1KS.Army.Resources.Mounts"),
        new DefaultChange(2, `${CFG.changePrefix}_om`, "PF1KS.Army.Resources.Mounts"),
        new DefaultChange(
          Math.max(Math.floor(armyConsumptionScaling[system.size] ?? 1), 1),
          `${CFG.changePrefix}_consumption`,
          "PF1KS.Army.Resources.Mounts"
        )
      );
    }
    if (system.resources.ranged) {
      changes.push(
        new DefaultChange(
          Math.max(Math.floor(armyConsumptionScaling[system.size] ?? 1), 1),
          `${CFG.changePrefix}_consumption`,
          "PF1KS.Army.Resources.Ranged"
        )
      );
    }

    if (system.resources.seCount) {
      changes.push(
        new DefaultChange(2, `${CFG.changePrefix}_om`, "PF1KS.Army.Resources.Siege"),
        new DefaultChange(3 * system.resources.seCount, `${CFG.changePrefix}_consumption`, "PF1KS.Army.Resources.Siege")
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
