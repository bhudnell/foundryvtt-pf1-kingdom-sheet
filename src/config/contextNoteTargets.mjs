import { armyAttributes, armyItemTypes, CFG, kingdomItemTypes, kingdomStats, settlementModifiers } from "./config.mjs";

export const contextNoteTargets = {
  [`${CFG.changePrefix}_consumption`]: { category: `${CFG.changePrefix}_misc`, label: "PF1KS.Consumption" },
  ...Object.entries(kingdomStats).reduce((acc, [key, label]) => {
    acc[`${CFG.changePrefix}_${key}`] = { category: `${CFG.changePrefix}_kingdom_stats`, label };
    return acc;
  }, {}),
  ...Object.entries(settlementModifiers).reduce((acc, [key, label]) => {
    acc[`${CFG.changePrefix}_${key}`] = { category: `${CFG.changePrefix}_settlement_modifiers`, label };
    return acc;
  }, {}),
  ...Object.entries(armyAttributes).reduce((acc, [key, label]) => {
    acc[`${CFG.changePrefix}_${key}`] = { category: `${CFG.changePrefix}_army_attributes`, label };
    return acc;
  }, {}),
};

export const contextNoteCategories = {
  [`${CFG.changePrefix}_kingdom_stats`]: {
    label: "PF1KS.KingdomStat",
    filters: { item: { include: kingdomItemTypes } },
  },
  [`${CFG.changePrefix}_settlement_modifiers`]: {
    label: "PF1KS.SettlementModifiers",
    filters: { item: { include: kingdomItemTypes } },
  },
  [`${CFG.changePrefix}_misc`]: {
    label: "PF1KS.Misc",
    filters: { item: { include: [...kingdomItemTypes, ...armyItemTypes] } },
  },
  [`${CFG.changePrefix}_army_attributes`]: {
    label: "PF1KS.ArmyAttributes",
    filters: { item: { include: armyItemTypes } },
  },
};
