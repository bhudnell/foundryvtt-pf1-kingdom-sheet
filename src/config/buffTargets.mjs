import {
  allSettlementModifiers,
  armyAttributes,
  armyItemTypes,
  changePrefix,
  kingdomItemTypes,
  kingdomStats,
  magicItemTypes,
} from "./config.mjs";

export const commonBuffTargets = {
  [`${changePrefix}_consumption`]: { category: `${changePrefix}_misc`, label: "PF1KS.Consumption" },
};

export const armyBuffTargets = {
  [`${changePrefix}_speed`]: {
    category: `${changePrefix}_misc`,
    label: "PF1.Movement.Speed",
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
};

export const kingdomBuffTargets = {
  ...Object.entries(kingdomStats).reduce((acc, [key, label]) => {
    acc[`${changePrefix}_${key}`] = { category: `${changePrefix}_kingdom_stats`, label };
    return acc;
  }, {}),
  ...Object.entries(allSettlementModifiers).reduce((acc, [key, label]) => {
    acc[`${changePrefix}_${key}`] = { category: `${changePrefix}_settlement_modifiers`, label };
    return acc;
  }, {}),
  ...Object.entries(magicItemTypes).reduce((acc, [key, label]) => {
    acc[`${changePrefix}_magic_item_${key}`] = { category: `${changePrefix}_magic_items`, label };
    return acc;
  }, {}),
  [`${changePrefix}_bonusBP`]: {
    category: `${changePrefix}_misc`,
    label: "PF1KS.BonusBP",
    filters: { item: { include: kingdomItemTypes } },
  },
  [`${changePrefix}_fame`]: {
    category: `${changePrefix}_misc`,
    label: "PF1KS.Fame",
    filters: { item: { include: kingdomItemTypes } },
  },
  [`${changePrefix}_infamy`]: {
    category: `${changePrefix}_misc`,
    label: "PF1KS.Infamy",
    filters: { item: { include: kingdomItemTypes } },
  },
  [`${changePrefix}_unrest_drop`]: {
    category: `${changePrefix}_misc`,
    label: "PF1KS.UnrestOnDrop",
    filters: { item: { include: kingdomItemTypes } },
  },
  [`${changePrefix}_unrest_continuous`]: {
    category: `${changePrefix}_misc`,
    label: "PF1KS.UnrestContinuous",
    filters: { item: { include: kingdomItemTypes } },
  },
};

export const buffTargets = {
  ...kingdomBuffTargets,
  ...armyBuffTargets,
  ...commonBuffTargets,
};

export const buffTargetCategories = {
  [`${changePrefix}_kingdom_stats`]: {
    label: "PF1KS.KingdomStat",
    filters: { item: { include: kingdomItemTypes } },
  },
  [`${changePrefix}_settlement_modifiers`]: {
    label: "PF1KS.SettlementModifiers",
    filters: { item: { include: kingdomItemTypes } },
  },
  [`${changePrefix}_magic_items`]: {
    label: "PF1KS.MagicItems",
    filters: { item: { include: kingdomItemTypes } },
  },
  [`${changePrefix}_misc`]: {
    label: "PF1.Misc",
    filters: { item: { include: [...kingdomItemTypes, ...armyItemTypes] } },
  },
  [`${changePrefix}_army_attributes`]: {
    label: "PF1KS.ArmyAttributes",
    filters: { item: { include: armyItemTypes } },
  },
};
