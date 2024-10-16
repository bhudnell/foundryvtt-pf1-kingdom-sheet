import { armyAttributes, armyItemTypes, kingdomItemTypes, kingdomStats, settlementModifiers } from "./config.mjs";

export const contextNoteTargets = {
  ...Object.entries(kingdomStats).reduce((acc, [key, label]) => {
    acc[key] = { category: "kingdom_stats", label };
    return acc;
  }, {}),
  ...Object.entries(settlementModifiers).reduce((acc, [key, label]) => {
    acc[key] = { category: "settlement_modifiers", label };
    return acc;
  }, {}),
  ...Object.entries(armyAttributes).reduce((acc, [key, label]) => {
    acc[key] = { category: "army_attributes", label };
    return acc;
  }, {}),
};

export const contextNoteCategories = {
  kingdom_stats: {
    label: "PF1KS.KingdomStat",
    filters: { item: { include: kingdomItemTypes } },
  },
  settlement_modifiers: {
    label: "PF1KS.SettlementModifiers",
    filters: { item: { include: kingdomItemTypes } },
  },
  army_attributes: {
    label: "PF1KS.ArmyAttributes",
    filters: { item: { include: armyItemTypes } },
  },
};
