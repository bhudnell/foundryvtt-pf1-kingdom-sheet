import { armyId, changePrefix, kingdomId, settlementId } from "../config/config.mjs";

/**
 * Shared targets (army/kingdom/settlement as noted)
 */
const SHARED = {
  // army/kingdom
  [`${changePrefix}_consumption`]: {
    [armyId]: "system.consumption.total",
    [kingdomId]: "system.consumption.total",
  },

  // kingdom/settlement
  [`${changePrefix}_economy`]: {
    [kingdomId]: "system.economy.total",
    [settlementId]: "system.kingdomStats.economy",
  },
  [`${changePrefix}_loyalty`]: {
    [kingdomId]: "system.loyalty.total",
    [settlementId]: "system.kingdomStats.loyalty",
  },
  [`${changePrefix}_stability`]: {
    [kingdomId]: "system.stability.total",
    [settlementId]: "system.kingdomStats.stability",
  },
  [`${changePrefix}_corruption`]: {
    [kingdomId]: "system.modifiers.corruption.total",
    [settlementId]: ["system.modifiers.corruption.settlementTotal", "system.modifiers.corruption.total"],
  },
  [`${changePrefix}_crime`]: {
    [kingdomId]: "system.modifiers.crime.total",
    [settlementId]: ["system.modifiers.crime.settlementTotal", "system.modifiers.crime.total"],
  },
  [`${changePrefix}_productivity`]: {
    [kingdomId]: "system.modifiers.productivity.total",
    [settlementId]: ["system.modifiers.productivity.settlementTotal", "system.modifiers.productivity.total"],
  },
  [`${changePrefix}_law`]: {
    [kingdomId]: "system.modifiers.law.total",
    [settlementId]: ["system.modifiers.law.settlementTotal", "system.modifiers.law.total"],
  },
  [`${changePrefix}_lore`]: {
    [kingdomId]: "system.modifiers.lore.total",
    [settlementId]: ["system.modifiers.lore.settlementTotal", "system.modifiers.lore.total"],
  },
  [`${changePrefix}_society`]: {
    [kingdomId]: "system.modifiers.society.total",
    [settlementId]: ["system.modifiers.society.settlementTotal", "system.modifiers.society.total"],
  },
  [`${changePrefix}_fame`]: {
    [kingdomId]: "system.fame.total",
    [settlementId]: "system.kingdomStats.fame",
  },
  [`${changePrefix}_infamy`]: {
    [kingdomId]: "system.infamy.total",
    [settlementId]: "system.kingdomStats.infamy",
  },
};

/**
 * Type-specific targets
 */
const TARGETS = {
  [armyId]: {
    [`${changePrefix}_speed`]: "system.speed.total",
    [`${changePrefix}_bonus_tactic`]: "system.tactics.max.total",
    [`${changePrefix}_dv`]: "system.dv.total",
    [`${changePrefix}_om`]: "system.om.total",
    [`${changePrefix}_damage`]: "system.damageBonus.total",
    [`${changePrefix}_morale`]: "system.morale.total",
  },

  [kingdomId]: {
    [`${changePrefix}_bonusBP`]: "system.bonusBP.total",
  },

  [settlementId]: {
    [`${changePrefix}_bpStorage`]: "system.kingdomStats.bpStorage",
    [`${changePrefix}_danger`]: "system.attributes.danger.total",
    [`${changePrefix}_defense`]: "system.attributes.defense.total",
    [`${changePrefix}_baseValue`]: "system.attributes.baseValue.total",
    [`${changePrefix}_maxBaseValue`]: "system.attributes.maxBaseValue.increase",
    [`${changePrefix}_purchaseLimit`]: "system.attributes.purchaseLimit.increase",
    [`${changePrefix}_spellcasting`]: "system.attributes.spellcasting.total",
    [`${changePrefix}_magic_item_minor`]: "system.magicItems.minor.max",
    [`${changePrefix}_magic_item_medium`]: "system.magicItems.medium.max",
    [`${changePrefix}_magic_item_major`]: "system.magicItems.major.max",
  },
};

// continuous unrest isnt being used yet so commenting out for now
// case `${changePrefix}_unrestContinuous`:
//   result.push("system.someFakeData");
//   break;

function resolveTargetPath(type, target) {
  // First check type-specific targets
  const specific = TARGETS[type]?.[target];
  if (specific) {
    return [].concat(specific);
  }

  // Then check shared targets for that type
  const shared = SHARED[target]?.[type];
  if (shared) {
    return [].concat(shared);
  }

  return null;
}

export function getChangeFlat(result, target, modifierType, value, actor) {
  if (!target.startsWith(pf1ks.config.changePrefix)) {
    return result;
  }

  const path = resolveTargetPath(actor.type, target);
  if (path?.length) {
    result.push(...path);
  }

  return result;
}
