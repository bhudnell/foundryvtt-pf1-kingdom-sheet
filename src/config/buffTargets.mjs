import { allSettlementModifiers, armyAttributes, armyItemTypes, kingdomItemTypes, kingdomStats } from "./config.mjs";

export const buffTargets = {
  ...Object.entries(kingdomStats).reduce((acc, [key, label]) => {
    acc[key] = { category: "kingdom_stats", label };
    return acc;
  }, {}),
  ...Object.entries(allSettlementModifiers).reduce((acc, [key, label]) => {
    acc[key] = { category: "settlement_modifiers", label };
    return acc;
  }, {}),
  consumption: { category: "pf1ks_misc", label: "PF1KS.Consumption" },
  bonusBP: {
    category: "pf1ks_misc",
    label: "PF1KS.BonusBP",
    filters: { item: { include: kingdomItemTypes } },
  },
  fame: { category: "pf1ks_misc", label: "PF1KS.Fame", filters: { item: { include: kingdomItemTypes } } },
  infamy: {
    category: "pf1ks_misc",
    label: "PF1KS.Infamy",
    filters: { item: { include: kingdomItemTypes } },
  },
  speed: {
    category: "pf1ks_misc",
    label: "PF1KS.Army.Speed",
    filters: { item: { include: armyItemTypes } },
  },
  bonus_tactic: {
    category: "pf1ks_misc",
    label: "PF1KS.Army.BonusTactic",
    filters: { item: { include: armyItemTypes } },
  },
  ...Object.entries(armyAttributes).reduce((acc, [key, label]) => {
    acc[key] = { category: "army_attributes", label };
    return acc;
  }, {}),
};

export const buffTargetCategories = {
  kingdom_stats: {
    label: "PF1KS.KingdomStat",
    filters: { item: { include: kingdomItemTypes } },
  },
  settlement_modifiers: {
    label: "PF1KS.SettlementModifiers",
    filters: { item: { include: kingdomItemTypes } },
  },
  pf1ks_misc: {
    label: "PF1KS.Misc",
    filters: { item: { include: [...kingdomItemTypes, ...armyItemTypes] } },
  },
  army_attributes: {
    label: "PF1KS.ArmyAttributes",
    filters: { item: { include: armyItemTypes } },
  },
};
