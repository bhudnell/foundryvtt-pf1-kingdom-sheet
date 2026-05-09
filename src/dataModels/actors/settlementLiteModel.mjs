import { ActorProxyModel } from "./actorProxyModel.mjs";
import { DistrictModel } from "./districtModel.mjs";
import { MagicItemModel } from "./magicItemModel.mjs";

export class SettlementLiteModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;

    return {
      districts: new fields.ArrayField(new fields.EmbeddedDataField(DistrictModel)),
      magicItems: new fields.SchemaField({
        minor: new fields.EmbeddedDataField(MagicItemModel),
        medium: new fields.EmbeddedDataField(MagicItemModel),
        major: new fields.EmbeddedDataField(MagicItemModel),
      }),
      attributes: new fields.SchemaField({
        government: new fields.StringField({
          initial: "aut",
          choices: Object.keys(pf1ks.config.settlementGovernments),
        }),
        alignment: new fields.StringField({ initial: "tn", choices: Object.keys(pf1.config.alignments) }),
        population: new fields.NumberField({ integer: true, initial: 0, nullable: false }),
        size: new fields.StringField({ initial: "thorpe", choices: Object.keys(pf1ks.config.settlementSizes) }),
      }),

      notes: new fields.SchemaField({
        value: new fields.HTMLField({ required: false, blank: true }),
      }),
    };
  }

  prepareBaseData() {
    for (const mi of Object.keys(pf1ks.config.magicItemTypes)) {
      this.magicItems[mi].max.increase = 0;
      this.magicItems[mi].max.total = 0;
    }

    for (const attr of Object.keys(pf1ks.config.sharedSettlementAttributes)) {
      this.attributes[attr] = {
        size: 0,
        total: 0,
      };

      if (["maxBaseValue", "purchaseLimit"].includes(attr)) {
        this.attributes[attr].increase = 0;
      }

      if (attr === "spellcasting") {
        this.attributes[attr].government = 0;
      }
    }

    // settlement modifiers
    this.modifiers = {};
    for (const modifier of Object.keys(pf1ks.config.settlementModifiers)) {
      this.modifiers[modifier] = {
        size: 0,
        alignment: 0,
        government: 0,
        total: 0,
      };
    }
  }

  prepareDerivedData() {
    // magic items
    for (const mi of Object.keys(pf1ks.config.magicItemTypes)) {
      this.magicItems[mi].max.total = this.magicItems[mi].max.base;
    }

    // settlement attributes
    for (const attr of Object.keys(pf1ks.config.sharedSettlementAttributes)) {
      // attribute size mod
      this.attributes[attr].size = pf1ks.config.settlementValues[this.attributes.size][attr];

      // spellcasting government
      if (attr === "spellcasting") {
        this.attributes.spellcasting.government =
          pf1ks.config.settlementGovernmentBonuses[this.attributes.government]?.spellcasting ?? 0;
      }

      // total
      this.attributes[attr].total = Object.entries(this.attributes[attr])
        .filter(([k, v]) => k !== "total" && typeof v === "number")
        .reduce((acc, [, v]) => acc + v, 0);
    }

    // settlement modifiers
    for (const modifier of Object.keys(pf1ks.config.settlementModifiers)) {
      const settlementValues = pf1ks.config.settlementValues[this.attributes.size];

      const size = settlementValues.modifiers;
      const alignment = pf1ks.config.alignmentEffects[this.attributes.alignment]?.[modifier] ?? 0;
      const government = pf1ks.config.settlementGovernmentBonuses[this.attributes.government]?.[modifier] ?? 0;

      const total = size + alignment + government;

      this.modifiers[modifier] = {
        size,
        alignment,
        government,
        total,
      };
    }
  }
}
