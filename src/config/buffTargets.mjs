import {
  settlementModifiers,
  armyAttributes,
  armyItemTypes,
  changePrefix,
  kingdomItemTypes,
  kingdomStats,
  magicItemTypes,
  settlementAttributes,
  settlementItemTypes,
  sharedSettlementAttributes,
  settlementOnlyAttributes,
  settlementLiteItemTypes,
  settlementLiteId,
  settlementId,
} from "./config.mjs";

export const buffTargets = {
  // army/kingdom/settlement
  [`${changePrefix}_consumption`]: {
    category: `${changePrefix}_misc`,
    label: "PF1KS.Consumption",
    filters: { item: { include: [...kingdomItemTypes, ...armyItemTypes, ...settlementItemTypes] } },
  },

  // kingdom/settlement/settlementLite
  ...Object.entries(settlementModifiers).reduce((acc, [key, label]) => {
    acc[`${changePrefix}_${key}`] = { category: `${changePrefix}_settlement_modifiers`, label };
    return acc;
  }, {}),

  // kingdom/settlement
  ...Object.entries(kingdomStats).reduce((acc, [key, label]) => {
    acc[`${changePrefix}_${key}`] = { category: `${changePrefix}_kingdom_stats`, label };
    return acc;
  }, {}),
  [`${changePrefix}_fame`]: {
    category: `${changePrefix}_misc`,
    label: "PF1KS.Fame",
    filters: { item: { include: [...kingdomItemTypes, ...settlementItemTypes] } },
  },
  [`${changePrefix}_infamy`]: {
    category: `${changePrefix}_misc`,
    label: "PF1KS.Infamy",
    filters: { item: { include: [...kingdomItemTypes, ...settlementItemTypes] } },
  },
  [`${changePrefix}_bpStorage`]: {
    category: `${changePrefix}_misc`,
    label: "PF1KS.BPStorage",
    filters: { item: { include: [...kingdomItemTypes, ...settlementItemTypes] } },
  },
  [`${changePrefix}_unrestDrop`]: {
    category: `${changePrefix}_misc`,
    label: "PF1KS.UnrestOnDrop",
    filters: { item: { include: [...kingdomItemTypes, ...settlementItemTypes] } },
  },

  // settlement/settlementLite
  [`${changePrefix}_magic_item_availability`]: {
    category: `${changePrefix}_magic_items`,
    label: "PF1KS.MagicItem.Availability",
    filters: { item: { include: [...kingdomItemTypes, ...settlementItemTypes] } },
  },
  ...Object.entries(sharedSettlementAttributes).reduce((acc, [key, label]) => {
    acc[`${changePrefix}_${key}`] = {
      category: `${changePrefix}_settlement_attributes`,
      label,
      filters: { item: { include: settlementItemTypes } },
    };
    return acc;
  }, {}),

  // army only
  [`${changePrefix}_speed`]: {
    category: `${changePrefix}_misc`,
    label: "PF1KS.Army.SpeedWithUnits",
    filters: { item: { include: armyItemTypes } },
  },
  [`${changePrefix}_bonus_tactic`]: {
    category: `${changePrefix}_misc`,
    label: "PF1KS.Army.BonusTactic",
    filters: { item: { include: armyItemTypes } },
  },
  ...Object.entries(armyAttributes).reduce((acc, [key, label]) => {
    acc[`${changePrefix}_${key}`] = { category: `${changePrefix}_army_attributes`, label };
    return acc;
  }, {}),

  // kingdom only
  [`${changePrefix}_bonusBP`]: {
    category: `${changePrefix}_misc`,
    label: "PF1KS.BonusBP",
    filters: { item: { include: kingdomItemTypes } },
  },
  [`${changePrefix}_unrestContinuous`]: {
    category: `${changePrefix}_misc`,
    label: "PF1KS.UnrestContinuous",
    filters: { item: { include: kingdomItemTypes } },
  },

  // settlement only
  ...Object.entries(magicItemTypes).reduce((acc, [key, label]) => {
    acc[`${changePrefix}_magic_item_${key}`] = {
      category: `${changePrefix}_magic_items`,
      label,
      filters: { item: { include: settlementItemTypes }, actor: { include: [settlementId] } },
    };
    return acc;
  }, {}),
  ...Object.entries(settlementOnlyAttributes).reduce((acc, [key, label]) => {
    acc[`${changePrefix}_${key}`] = {
      category: `${changePrefix}_settlement_attributes`,
      label,
      filters: { item: { include: settlementItemTypes }, actor: { include: [settlementId] } },
    };
    return acc;
  }, {}),
};

export const buffTargetCategories = {
  [`${changePrefix}_kingdom_stats`]: {
    label: "PF1KS.KingdomStat",
    filters: {
      item: { include: [...kingdomItemTypes, ...settlementItemTypes] },
      actor: { exclude: [settlementLiteId] },
    },
  },
  [`${changePrefix}_settlement_modifiers`]: {
    label: "PF1KS.SettlementModifiers",
    filters: { item: { include: [...kingdomItemTypes, ...settlementItemTypes, ...settlementLiteItemTypes] } },
  },
  [`${changePrefix}_settlement_attributes`]: {
    label: "PF1KS.SettlementAttributes",
    filters: { item: { include: settlementItemTypes, ...settlementLiteItemTypes } },
  },
  [`${changePrefix}_magic_items`]: {
    label: "PF1KS.MagicItems",
    filters: { item: { include: settlementItemTypes, ...settlementLiteItemTypes } },
  },
  [`${changePrefix}_misc`]: {
    label: "PF1.Misc",
    filters: {
      item: { include: [...kingdomItemTypes, ...settlementItemTypes, ...armyItemTypes] },
      actor: { exclude: [settlementLiteId] },
    },
  },
  [`${changePrefix}_army_attributes`]: {
    label: "PF1KS.ArmyAttributes",
    filters: { item: { include: armyItemTypes } },
  },
};
