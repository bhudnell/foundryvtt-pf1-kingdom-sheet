import {
  armyAttributes,
  armyItemTypes,
  changePrefix,
  kingdomItemTypes,
  kingdomStats,
  settlementAttributes,
  settlementItemTypes,
  settlementModifiers,
} from "./config.mjs";

// TODO update this to include settlements

export const contextNoteTargets = {
  [`${changePrefix}_consumption`]: {
    category: `${changePrefix}_misc`,
    label: "PF1KS.Consumption",
    filters: { item: { include: [...kingdomItemTypes, ...armyItemTypes] } },
  },
  [`${changePrefix}_bonusBP`]: {
    category: `${changePrefix}_misc`,
    label: "PF1KS.BonusBP",
    filters: { item: { include: kingdomItemTypes } },
  },
  ...Object.entries(kingdomStats).reduce((acc, [key, label]) => {
    acc[`${changePrefix}_${key}`] = { category: `${changePrefix}_kingdom_stats`, label };
    return acc;
  }, {}),
  ...Object.entries(settlementAttributes).reduce((acc, [key, label]) => {
    acc[`${changePrefix}_${key}`] = { category: `${changePrefix}_settlement_attributes`, label };
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
    filters: { item: { include: [...kingdomItemTypes, ...settlementItemTypes] } },
  },
  [`${changePrefix}_settlement_attributes`]: {
    label: "PF1KS.SettlementAttributes",
    filters: { item: { include: settlementItemTypes } }, // TODO what to do with defense (should be both kingdom and settlement)
  },
  [`${changePrefix}_settlement_modifiers`]: {
    label: "PF1KS.SettlementModifiers",
    filters: { item: { include: [...kingdomItemTypes, ...settlementItemTypes] } },
  },
  [`${changePrefix}_misc`]: {
    label: "PF1.Misc",
    filters: { item: { include: [...kingdomItemTypes, ...settlementItemTypes, ...armyItemTypes] } },
  },
  [`${changePrefix}_army_attributes`]: {
    label: "PF1KS.ArmyAttributes",
    filters: { item: { include: armyItemTypes } },
  },
};
