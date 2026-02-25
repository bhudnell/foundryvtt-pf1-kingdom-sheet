import { DefaultChange, asSignedPercent, capitalize } from "../../util/utils.mjs";

import { BaseActor } from "./baseActor.mjs";

export class SettlementActor extends BaseActor {
  prepareDerivedData() {
    super.prepareDerivedData();

    // this all has to be done here since it all relies on changes being applied already

    // magic items
    for (const key of Object.keys(pf1ks.config.magicItemTypes)) {
      const max = this.system.magicItems[key].max;
      const oldItems = this.system.magicItems[key].items;
      this.system.magicItems[key].items = oldItems.concat(Array(Math.max(max - oldItems.length, 0)).fill(null));
    }

    // maxBaseValue and purchaseLimit total update based in increase
    for (const attr of ["maxBaseValue", "purchaseLimit"]) {
      const { total, increase } = this.system.attributes[attr];

      this.system.attributes[attr].total = Math.floor(total * (1 + increase / 100));
    }

    // base value adjustment
    if (this.system.attributes.baseValue.total > this.system.attributes.maxBaseValue.total) {
      this.system.attributes.baseValue.total = this.system.attributes.maxBaseValue.total;
      this.system.attributes.baseValue.overridden = true;
    }

    for (const modifier of Object.keys(pf1ks.config.settlementModifiers)) {
      // set settlement modifiers total to settlementTotal
      this.system.modifiers[modifier].total = this.system.modifiers[modifier].settlementTotal;

      // take higher of settlement modifiers and kingdom modifiers
      const kingdom = this.system.kingdom?.actor?.system;
      if (kingdom?.settings.optionalRules.kingdomModifiers) {
        this.system.modifiers[modifier].total = Math.max(
          this.system.modifiers[modifier].total,
          kingdom.modifiers[modifier].total
        );
      }
    }

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

  prepareConditions() {
    this.system.conditions = {};
  }
}
