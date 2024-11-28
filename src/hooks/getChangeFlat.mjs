import { CFG } from "../config/config.mjs";

export function getChangeFlat(result, target, modifierType, value, actor) {
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
    // settlement modifiers are handled outside the normal change flow
    case `${CFG.changePrefix}_defense`:
    case `${CFG.changePrefix}_baseValue`:
    case `${CFG.changePrefix}_corruption`:
    case `${CFG.changePrefix}_crime`:
    case `${CFG.changePrefix}_productivity`:
    case `${CFG.changePrefix}_law`:
    case `${CFG.changePrefix}_lore`:
    case `${CFG.changePrefix}_society`:
      break;
    case `${CFG.changePrefix}_bonusBP`:
      result.push("system.bonusBP.total");
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
