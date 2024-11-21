import {
  allSettlementModifiers,
  armyAttributes,
  armyItemTypes,
  CFG,
  kingdomItemTypes,
  kingdomStats,
} from "./config.mjs";

export const commonBuffTargets = {
  [`${CFG.changePrefix}_consumption`]: { category: `${CFG.changePrefix}_misc`, label: "PF1KS.Consumption" },
};

export const armyBuffTargets = {
  [`${CFG.changePrefix}_speed`]: {
    category: `${CFG.changePrefix}_misc`,
    label: "PF1KS.Army.Speed",
    filters: { item: { include: armyItemTypes } },
  },
  [`${CFG.changePrefix}_bonus_tactic`]: {
    category: `${CFG.changePrefix}_misc`,
    label: "PF1KS.Army.BonusTactic",
    filters: { item: { include: armyItemTypes } },
  },
  ...Object.entries(armyAttributes).reduce((acc, [key, label]) => {
    acc[`${CFG.changePrefix}_${key}`] = { category: `${CFG.changePrefix}_army_attributes`, label };
    return acc;
  }, {}),
};

export const kingdomBuffTargets = {
  ...Object.entries(kingdomStats).reduce((acc, [key, label]) => {
    acc[`${CFG.changePrefix}_${key}`] = { category: `${CFG.changePrefix}_kingdom_stats`, label };
    return acc;
  }, {}),
  ...Object.entries(allSettlementModifiers).reduce((acc, [key, label]) => {
    acc[`${CFG.changePrefix}_${key}`] = { category: `${CFG.changePrefix}_settlement_modifiers`, label };
    return acc;
  }, {}),
  [`${CFG.changePrefix}_bonusBP`]: {
    category: `${CFG.changePrefix}_misc`,
    label: "PF1KS.BonusBP",
    filters: { item: { include: kingdomItemTypes } },
  },
  [`${CFG.changePrefix}_fame`]: {
    category: `${CFG.changePrefix}_misc`,
    label: "PF1KS.Fame",
    filters: { item: { include: kingdomItemTypes } },
  },
  [`${CFG.changePrefix}_infamy`]: {
    category: `${CFG.changePrefix}_misc`,
    label: "PF1KS.Infamy",
    filters: { item: { include: kingdomItemTypes } },
  },
};

export const buffTargets = {
  ...kingdomBuffTargets,
  ...armyBuffTargets,
  ...commonBuffTargets,
};

export const buffTargetCategories = {
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
