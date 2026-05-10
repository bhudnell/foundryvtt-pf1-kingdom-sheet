import {
  armyAttributes,
  armyItemTypes,
  changePrefix,
  kingdomItemTypes,
  kingdomStats,
  settlementAttributes,
  settlementId,
  settlementItemTypes,
  settlementLiteId,
  settlementLiteItemTypes,
  settlementModifiers,
  settlementOnlyAttributes,
  sharedSettlementAttributes,
} from "./config.mjs";

export const contextNoteTargets = {
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

  // settlement/settlementLite
  ...Object.entries(sharedSettlementAttributes).reduce((acc, [key, label]) => {
    acc[`${changePrefix}_${key}`] = {
      category: `${changePrefix}_settlement_attributes`,
      label,
      filters: { item: { include: [...settlementItemTypes, ...settlementLiteItemTypes] } },
    };
    return acc;
  }, {}),

  // army only
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

  // settlement only
  ...Object.entries(settlementOnlyAttributes).reduce((acc, [key, label]) => {
    acc[`${changePrefix}_${key}`] = {
      category: `${changePrefix}_settlement_attributes`,
      label,
      filters: { item: { include: settlementItemTypes }, actor: { include: [settlementId] } },
    };
    return acc;
  }, {}),
};

export const contextNoteCategories = {
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
    filters: { item: { include: [...settlementItemTypes, ...settlementLiteItemTypes] } },
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
