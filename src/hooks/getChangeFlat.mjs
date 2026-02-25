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
    [settlementId]: "system.kingdom.economy",
  },
  [`${changePrefix}_loyalty`]: {
    [kingdomId]: "system.loyalty.total",
    [settlementId]: "system.kingdom.loyalty",
  },
  [`${changePrefix}_stability`]: {
    [kingdomId]: "system.stability.total",
    [settlementId]: "system.kingdom.stability",
  },
  [`${changePrefix}_magic_item_minor`]: {
    [kingdomId]: "system.magicItems.minor.max",
    [settlementId]: "system.magicItems.minor.max",
  },
  [`${changePrefix}_magic_item_medium`]: {
    [kingdomId]: "system.magicItems.medium.max",
    [settlementId]: "system.magicItems.medium.max",
  },
  [`${changePrefix}_magic_item_major`]: {
    [kingdomId]: "system.magicItems.major.max",
    [settlementId]: "system.magicItems.major.max",
  },
  [`${changePrefix}_defense`]: {
    [kingdomId]: "system.attributes.defense.total",
    [settlementId]: "system.attributes.defense.total",
  },
  [`${changePrefix}_corruption`]: {
    [kingdomId]: "system.modifiers.corruption.total",
    [settlementId]: "system.modifiers.corruption.settlementTotal",
  },
  [`${changePrefix}_crime`]: {
    [kingdomId]: "system.modifiers.crime.total",
    [settlementId]: "system.modifiers.crime.settlementTotal",
  },
  [`${changePrefix}_productivity`]: {
    [kingdomId]: "system.modifiers.productivity.total",
    [settlementId]: "system.modifiers.productivity.settlementTotal",
  },
  [`${changePrefix}_law`]: {
    [kingdomId]: "system.modifiers.law.total",
    [settlementId]: "system.modifiers.law.settlementTotal",
  },
  [`${changePrefix}_lore`]: {
    [kingdomId]: "system.modifiers.lore.total",
    [settlementId]: "system.modifiers.lore.settlementTotal",
  },
  [`${changePrefix}_society`]: {
    [kingdomId]: "system.modifiers.society.total",
    [settlementId]: "system.modifiers.society.settlementTotal",
  },
  [`${changePrefix}_fame`]: {
    [kingdomId]: "system.fame.total",
    [settlementId]: "system.kingdom.fame",
  },
  [`${changePrefix}_infamy`]: {
    [kingdomId]: "system.infamy.total",
    [settlementId]: "system.kingdom.infamy",
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
    [`${changePrefix}_bpStorage`]: "system.kingdom.bpStorage",
    [`${changePrefix}_danger`]: "system.attributes.danger.total",
    [`${changePrefix}_baseValue`]: "system.attributes.baseValue.total",
    [`${changePrefix}_maxBaseValue`]: "system.attributes.maxBaseValue.increase",
    [`${changePrefix}_purchaseLimit`]: "system.attributes.purchaseLimit.increase",
    [`${changePrefix}_spellcasting`]: "system.attributes.spellcasting.total",
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
    return specific;
  }

  // Then check shared targets for that type
  const shared = SHARED[target]?.[type];
  if (shared) {
    return shared;
  }

  return null;
}

export function getChangeFlat(result, target, modifierType, value, actor) {
  if (!target.startsWith(pf1ks.config.changePrefix)) {
    return result;
  }

  const path = resolveTargetPath(actor.type, target);
  if (path) {
    result.push(path);
  }

  return result;
}
