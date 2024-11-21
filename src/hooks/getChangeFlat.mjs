import { CFG } from "../config/config.mjs";

export function getChangeFlat(result, target, modifierType, value) {
  if (!target.startsWith(CFG.changePrefix)) {
    return result;
  }

  switch (target) {
    case `${CFG.changePrefix}_consumption`:
      result.push("system.consumption.total");
      break;
    case `${CFG.changePrefix}_speed`:
      result.push("system.speed.total");
      break;
    case `${CFG.changePrefix}_bonus_tactic`:
      result.push("system.tactics.max.total");
      break;
    case `${CFG.changePrefix}_dv`:
      result.push("system.dv.total");
      break;
    case `${CFG.changePrefix}_om`:
      result.push("system.om.total");
      break;
    case `${CFG.changePrefix}_damage`:
      result.push("system.damageBonus.total");
      break;
    case `${CFG.changePrefix}_morale`:
      result.push("system.morale.total");
      break;
    case `${CFG.changePrefix}_economy`:
      result.push("system.economy.total");
      break;
    case `${CFG.changePrefix}_loyalty`:
      result.push("system.loyalty.total");
      break;
    case `${CFG.changePrefix}_stability`:
      result.push("system.stability.total");
      break;
    case `${CFG.changePrefix}_defense`: // todo settlement modifiers
      result.push("system.morale.total");
      break;
    case `${CFG.changePrefix}_baseValue`:
      result.push("system.morale.total");
      break;
    case `${CFG.changePrefix}_corruption`:
      result.push("system.morale.total");
      break;
    case `${CFG.changePrefix}_crime`:
      result.push("system.morale.total");
      break;
    case `${CFG.changePrefix}_productivity`:
      result.push("system.morale.total");
      break;
    case `${CFG.changePrefix}_law`:
      result.push("system.morale.total");
      break;
    case `${CFG.changePrefix}_lore`:
      result.push("system.morale.total");
      break;
    case `${CFG.changePrefix}_society`:
      result.push("system.morale.total");
      break;
    case `${CFG.changePrefix}_bonusBP`: // todo bonus BP
      result.push("system.morale.total");
      break;
    case `${CFG.changePrefix}_fame`:
      result.push("system.fame.total");
      break;
    case `${CFG.changePrefix}_infamy`:
      result.push("system.infamy.total");
      break;
  }

  return result;
}
