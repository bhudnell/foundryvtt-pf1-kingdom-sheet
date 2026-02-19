import { DefaultChange, asSignedPercent, capitalize } from "../../util/utils.mjs";

import { BaseActor } from "./baseActor.mjs";

export class SettlementActor extends BaseActor {
  prepareDerivedData() {
    super.prepareDerivedData();

    // magic items
    for (const key of Object.keys(pf1ks.config.magicItemTypes)) {
      const max = this.system.magicItems[key].max;
      const oldItems = this.system.magicItems[key].items;
      this.system.magicItems[key].items = oldItems.concat(Array(Math.max(max - oldItems.length, 0)).fill(null));
    }

    // TODO
    //   // the below is split between here and settlementModel.mjs prepareDerivedData because of the change system.
    //   // size, alignment, and government are handled in settlementModel.mjs and everything else is handled here

    //   // settlement attributes (danger, baseValue, maxBaseValue, spellcasting, purchaseLimit)
    //   for (const attr of Object.keys(pf1ks.config.settlementAttributes)) {
    //     const { size, government } = settlement.attributes[attr];
    //     const buildings = this._getChanges(attr, pf1ks.config.buildingId, settlement.id);
    //     const features = this._getChanges(attr, pf1ks.config.featureId, settlement.id);

    //     let total = (size ?? 0) + (government ?? 0);
    //     if (["maxBaseValue", "purchaseLimit"].includes(attr)) {
    //       total = Math.floor(total * (1 + (buildings + features) / 100));
    //     } else {
    //       total += buildings + features;
    //     }

    //     settlement.attributes[attr] = {
    //       ...settlement.attributes[attr],
    //       buildings,
    //       features,
    //       total,
    //     };
    //   }

    //   // base value adjustment
    //   if (settlement.attributes.baseValue.total > settlement.attributes.maxBaseValue.total) {
    //     settlement.attributes.baseValue.total = settlement.attributes.maxBaseValue.total;
    //     settlement.attributes.baseValue.overridden = true;
    //   }

    //   // settlement modifiers
    //   for (const modifier of Object.keys(pf1ks.config.settlementModifiers)) {
    //     const { size, kingdomAlignment, kingdomGovernment, settlementAlignment, settlementGovernment } =
    //       settlement.modifiers[modifier];
    //     const buildings = this._getChanges(modifier, pf1ks.config.buildingId, settlement.id);
    //     const features = this._getChanges(modifier, pf1ks.config.featureId, settlement.id);

    //     let settlementTotal =
    //       size +
    //       kingdomAlignment +
    //       kingdomGovernment +
    //       settlementAlignment +
    //       settlementGovernment +
    //       buildings +
    //       features;

    //     settlement.modifiers[modifier] = {
    //       ...settlement.modifiers[modifier],
    //       buildings,
    //       features,
    //       settlementTotal,
    //       total: settlementTotal,
    //     };
    //   }

    //   // take higher of settlement modifiers and kingdom modifiers
    //   if (this.system.settings.optionalRules.kingdomModifiers) {
    //     for (const settlement of this.system.settlements) {
    //       for (const modifier of Object.keys(pf1ks.config.settlementModifiers)) {
    //         settlement.modifiers[modifier].total = Math.max(
    //           settlement.modifiers[modifier].total,
    //           this.system.modifiers[modifier].total
    //         );
    //       }
    //     }
    //   }

    // overlapping buildings check
    const updates = [];
    const gridBuildings = this.itemTypes[pf1ks.config.buildingId].filter((b) => b.inGrid);
    for (const building of gridBuildings) {
      const districtBuildings = gridBuildings.filter(
        (db) => db.system.districtId === building.system.districtId && db.id !== building.id
      );

      const overlaps = districtBuildings.some(
        (other) =>
          !(
            building.system.x + building.system.width <= other.system.x || // is left of other
            other.system.x + other.system.width <= building.system.x || // is right of other
            building.system.y + building.system.height <= other.system.y || // is above other
            other.system.y + other.system.height <= building.system.y // is below other
          )
      );

      if (overlaps) {
        updates.push({
          _id: building.id,
          system: {
            x: null,
            y: null,
          },
        });
      }
    }
    this.updateEmbeddedDocuments("Item", updates);

    //   // deleting this because it only exists to get settlement modifier changes to parse
    //   delete this.system.someFakeData;
  }

  // _prepareTypeChanges(changes) {
  //   const system = this.system;
  // }

  // getSourceDetails(path) {
  //   const sources = super.getSourceDetails(path);

  //   const baseLabel = game.i18n.localize("PF1.Base");

  //   // settlement stuff
  //   const settlementRE = /^system\.settlements\.(?<idx>\w+)\.(?<detail>.+)$/.exec(path);
  //   if (settlementRE) {
  //     const { idx, detail } = settlementRE.groups;
  //     const s = this.system.settlements[idx];

  //     // attributes
  //     const sAttrRE = /^attributes\.(?<attr>\w+)\.total$/.exec(detail);
  //     if (sAttrRE) {
  //       const { attr } = sAttrRE.groups;
  //       const isPercent = ["maxBaseValue", "purchaseLimit"].includes(attr);

  //       if (s.attributes[attr].size) {
  //         sources.push({
  //           name: game.i18n.localize("PF1.Size"),
  //           value: s.attributes[attr].size,
  //         });
  //       }
  //       if (s.attributes[attr].government) {
  //         sources.push({
  //           name: game.i18n.localize("PF1KS.GovernmentLabel"),
  //           value: s.attributes[attr].government,
  //         });
  //       }
  //       if (s.attributes[attr].buildings) {
  //         sources.push({
  //           name: game.i18n.localize("PF1KS.Buildings"),
  //           value: isPercent ? asSignedPercent(s.attributes[attr].buildings) : s.attributes[attr].buildings,
  //         });
  //       }
  //       if (s.attributes[attr].improvements) {
  //         sources.push({
  //           name: game.i18n.localize("PF1KS.Improvements"),
  //           value: isPercent ? asSignedPercent(s.attributes[attr].improvements) : s.attributes[attr].improvements,
  //         });
  //       }
  //       if (s.attributes[attr].events) {
  //         sources.push({
  //           name: game.i18n.localize("PF1KS.Events"),
  //           value: isPercent ? asSignedPercent(s.attributes[attr].events) : s.attributes[attr].events,
  //         });
  //       }

  //       // override handling for any field that has a max value (currently just baseValue)
  //       if (s.attributes[attr].overridden) {
  //         sources.push({
  //           name: game.i18n.localize(`PF1KS.Max${capitalize(attr)}`),
  //           value: game.i18n.format("PF1.SetTo", { value: s.attributes[attr].total }),
  //         });
  //       }
  //     }

  //     // modifiers
  //     const sModRE = /^modifiers\.(?<mod>\w+)\.total$/.exec(detail);
  //     if (sModRE) {
  //       const { mod } = sModRE.groups;

  //       if (s.modifiers[mod].size) {
  //         sources.push({
  //           name: game.i18n.localize("PF1.Size"),
  //           value: s.modifiers[mod].size,
  //         });
  //       }
  //       if (s.modifiers[mod].kingdomAlignment) {
  //         sources.push({
  //           name: game.i18n.localize("PF1KS.KingdomAlignment"),
  //           value: s.modifiers[mod].kingdomAlignment,
  //         });
  //       }
  //       if (s.modifiers[mod].kingdomGovernment) {
  //         sources.push({
  //           name: game.i18n.localize("PF1KS.KingdomGovernment"),
  //           value: s.modifiers[mod].kingdomGovernment,
  //         });
  //       }
  //       if (s.modifiers[mod].settlementAlignment) {
  //         sources.push({
  //           name: game.i18n.localize("PF1KS.SettlementAlignment"),
  //           value: s.modifiers[mod].settlementAlignment,
  //         });
  //       }
  //       if (s.modifiers[mod].settlementGovernment) {
  //         sources.push({
  //           name: game.i18n.localize("PF1KS.SettlementGovernment"),
  //           value: s.modifiers[mod].settlementGovernment,
  //         });
  //       }
  //       if (s.modifiers[mod].buildings) {
  //         sources.push({
  //           name: game.i18n.localize("PF1KS.Buildings"),
  //           value: s.modifiers[mod].buildings,
  //         });
  //       }
  //       if (s.modifiers[mod].improvements) {
  //         sources.push({
  //           name: game.i18n.localize("PF1KS.Improvements"),
  //           value: s.modifiers[mod].improvements,
  //         });
  //       }
  //       if (s.modifiers[mod].events) {
  //         sources.push({
  //           name: game.i18n.localize("PF1KS.Events"),
  //           value: s.modifiers[mod].events,
  //         });
  //       }
  //       if (s.modifiers[mod].total > s.modifiers[mod].settlementTotal) {
  //         sources.push({
  //           name: game.i18n.localize("PF1KS.KingdomModifier"),
  //           value: game.i18n.format("PF1.SetTo", { value: s.modifiers[mod].total }),
  //         });
  //       }
  //     }
  //   }

  //   return sources;
  // }

  _getChanges(target, type) {
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
        return true;
      })
      .reduce((total, c) => total + c.value, 0);
  }

  prepareConditions() {
    this.system.conditions = {};
  }
}
