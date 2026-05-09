import { DefaultChange, asSignedPercent, capitalize } from "../../util/utils.mjs";

import { BaseActor } from "./baseActor.mjs";

export class SettlementActor extends BaseActor {
  prepareDerivedData() {
    super.prepareDerivedData();

    // this all has to be done here since it all relies on changes being applied already

    // magic items
    for (const magicItem of Object.values(this.system.magicItems)) {
      magicItem.max = Math.floor(magicItem.max * (1 + magicItem.increase / 100));

      const missing = magicItem.max - magicItem.items.length;
      if (missing > 0) {
        magicItem.items.push(...Array(missing).fill(null));
      }
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
      // take higher of settlement modifiers and kingdom modifiers
      const kingdom = this.system.kingdom?.actor?.system;
      if (kingdom?.settings.optionalRules.kingdomModifiers) {
        this.system.modifiers[modifier].total = Math.max(
          this.system.modifiers[modifier].settlementTotal,
          kingdom?.modifiers?.[modifier].total ?? 0
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

  getSourceDetails(path) {
    const sources = super.getSourceDetails(path);
    const data = this.system;

    // magic items
    const miRE = /^system\.magicItems\.(?<mi>\w+)\.max$/.exec(path);
    if (miRE) {
      const { mi } = miRE.groups;

      if (data.magicItems[mi].increase) {
        const changeGrp = this.sourceInfo[`system.magicItems.${mi}.increase`] ?? {};
        sources.push(
          ...Object.values(changeGrp)
            .flat()
            .filter((src) => src.operator !== "add" || src.value !== 0)
            .map((src) => ({
              name: this.constructor._getSourceLabel(src).replace(/[[\]]/g, ""),
              value: asSignedPercent(src.value),
            }))
        );
        sources.push({
          name: game.i18n.localize(data.magicItems[mi].increase > 0 ? "PF1KS.Increase" : "PF1KS.Decrease"),
          value: game.i18n.format("PF1KS.IncreaseTotal", {
            increase: asSignedPercent(data.magicItems[mi].increase),
            total: data.magicItems[mi].max,
          }),
        });
      }
    }

    // attributes
    const sAttrRE = /^system\.attributes\.(?<attr>\w+)\.total$/.exec(path);
    if (sAttrRE) {
      const { attr } = sAttrRE.groups;
      const isPercent = ["maxBaseValue", "purchaseLimit"].includes(attr);

      if (data.attributes[attr].government) {
        sources.unshift({
          name: game.i18n.localize("PF1KS.GovernmentLabel"),
          value: data.attributes[attr].government,
        });
      }
      if (data.attributes[attr].size) {
        sources.unshift({
          name: game.i18n.localize("PF1.Size"),
          value: data.attributes[attr].size,
        });
      }
      if (data.attributes[attr].increase) {
        const changeGrp = this.sourceInfo[`system.attributes.${attr}.increase`] ?? {};
        sources.push(
          ...Object.values(changeGrp)
            .flat()
            .filter((src) => src.operator !== "add" || src.value !== 0)
            .map((src) => ({
              name: this.constructor._getSourceLabel(src).replace(/[[\]]/g, ""),
              value: asSignedPercent(src.value),
            }))
        );
        sources.push({
          name: game.i18n.localize(data.attributes[attr].increase > 0 ? "PF1KS.Increase" : "PF1KS.Decrease"),
          value: game.i18n.format("PF1KS.IncreaseTotal", {
            increase: asSignedPercent(data.attributes[attr].increase),
            total: data.attributes[attr].total,
          }),
        });
      }
      // override handling for any field that has a max value (currently just baseValue)
      if (data.attributes[attr].overridden) {
        sources.push({
          name: game.i18n.localize(`PF1KS.Max${capitalize(attr)}`),
          value: game.i18n.format("PF1.SetTo", { value: data.attributes[attr].total }),
        });
      }
    }

    // modifiers
    const sModRE = /^system\.modifiers\.(?<mod>\w+)\.total$/.exec(path);
    if (sModRE) {
      const { mod } = sModRE.groups;

      if (data.modifiers[mod].kingdomAlignment) {
        sources.unshift({
          name: game.i18n.localize("PF1KS.KingdomAlignment"),
          value: data.modifiers[mod].kingdomAlignment,
        });
      }
      if (data.modifiers[mod].kingdomGovernment) {
        sources.unshift({
          name: game.i18n.localize("PF1KS.KingdomGovernment"),
          value: data.modifiers[mod].kingdomGovernment,
        });
      }
      if (data.modifiers[mod].alignment) {
        sources.unshift({
          name: game.i18n.localize("PF1.Alignment"),
          value: data.modifiers[mod].alignment,
        });
      }
      if (data.modifiers[mod].government) {
        sources.unshift({
          name: game.i18n.localize("PF1KS.GovernmentLabel"),
          value: data.modifiers[mod].government,
        });
      }
      if (data.modifiers[mod].size) {
        sources.unshift({
          name: game.i18n.localize("PF1.Size"),
          value: data.modifiers[mod].size,
        });
      }
      // remove if moving kingdom modifier override into prepareTypeChanges
      if (data.modifiers[mod].total > data.modifiers[mod].settlementTotal) {
        sources.push({
          name: game.i18n.localize("PF1KS.KingdomModifier"),
          value: game.i18n.format("PF1.SetTo", { value: data.modifiers[mod].total }),
        });
      }
    }

    return sources;
  }

  prepareConditions() {
    this.system.conditions = {};
  }
}
