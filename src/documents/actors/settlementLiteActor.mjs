import { DefaultChange, asSignedPercent, capitalize } from "../../util/utils.mjs";

import { BaseActor } from "./baseActor.mjs";

export class SettlementLiteActor extends BaseActor {
  prepareDerivedData() {
    super.prepareDerivedData();

    // this all has to be done here since it all relies on changes being applied already

    // magic items
    for (const key of Object.keys(pf1ks.config.magicItemTypes)) {
      this.system.magicItems[key].max.total = Math.floor(
        this.system.magicItems[key].max.total * (1 + this.system.magicItems[key].max.increase / 100)
      );

      const max = this.system.magicItems[key].max.total;
      const oldItems = this.system.magicItems[key].items;
      this.system.magicItems[key].items = oldItems.concat(Array(Math.max(max - oldItems.length, 0)).fill(null));
    }

    // maxBaseValue and purchaseLimit total update based in increase
    for (const attr of ["maxBaseValue", "purchaseLimit"]) {
      const { total, increase } = this.system.attributes[attr];

      this.system.attributes[attr].total = Math.floor(total * (1 + increase / 100));
    }
  }

  // _prepareTypeChanges(changes) {
  //   const system = this.system;
  // }

  getSourceDetails(path) {
    const sources = super.getSourceDetails(path);
    const data = this.system;

    // magic items
    const miRE = /^system\.magicItems\.(?<mi>\w+)\.max\.total$/.exec(path);
    if (miRE) {
      const { mi } = miRE.groups;

      if (data.magicItems[mi].max.increase) {
        const changeGrp = this.sourceInfo[`system.magicItems.${mi}.max.increase`] ?? {};
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
          name: game.i18n.localize(data.magicItems[mi].max.increase > 0 ? "PF1KS.Increase" : "PF1KS.Decrease"),
          value: game.i18n.format("PF1KS.IncreaseTotal", {
            increase: asSignedPercent(data.magicItems[mi].max.increase),
            total: data.magicItems[mi].max.total,
          }),
        });
      }
    }

    // attributes
    const sAttrRE = /^system\.attributes\.(?<attr>\w+)\.total$/.exec(path);
    if (sAttrRE) {
      const { attr } = sAttrRE.groups;

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
    }

    // modifiers
    const sModRE = /^system\.modifiers\.(?<mod>\w+)\.total$/.exec(path);
    if (sModRE) {
      const { mod } = sModRE.groups;

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
    }

    return sources;
  }

  prepareConditions() {
    this.system.conditions = {};
  }
}
