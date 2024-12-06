import {
  armyAttributes,
  armyItemTypes,
  changePrefix,
  kingdomItemTypes,
  kingdomStats,
  settlementModifiers,
} from "./config.mjs";

export const contextNoteTargets = {
  [`${changePrefix}_consumption`]: { category: `${changePrefix}_misc`, label: "PF1KS.Consumption" },
  ...Object.entries(kingdomStats).reduce((acc, [key, label]) => {
    acc[`${changePrefix}_${key}`] = { category: `${changePrefix}_kingdom_stats`, label };
    return acc;
  }, {}),
  ...Object.entries(settlementModifiers).reduce((acc, [key, label]) => {
    acc[`${changePrefix}_${key}`] = { category: `${changePrefix}_settlement_modifiers`, label };
    return acc;
  }, {}),
  ...Object.entries(armyAttributes).reduce((acc, [key, label]) => {
    acc[`${changePrefix}_${key}`] = { category: `${changePrefix}_army_attributes`, label };
    return acc;
  }, {}),
};

export const contextNoteCategories = {
  [`${changePrefix}_kingdom_stats`]: {
    label: "PF1KS.KingdomStat",
    filters: { item: { include: kingdomItemTypes } },
  },
  [`${changePrefix}_settlement_modifiers`]: {
    label: "PF1KS.SettlementModifiers",
    filters: { item: { include: kingdomItemTypes } },
  },
  [`${changePrefix}_misc`]: {
    label: "PF1KS.Misc",
    filters: { item: { include: [...kingdomItemTypes, ...armyItemTypes] } },
  },
  [`${changePrefix}_army_attributes`]: {
    label: "PF1KS.ArmyAttributes",
    filters: { item: { include: armyItemTypes } },
  },
};
