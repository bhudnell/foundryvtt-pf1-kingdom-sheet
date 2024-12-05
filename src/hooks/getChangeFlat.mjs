export function getChangeFlat(result, target, modifierType, value, actor) {
  if (!target.startsWith(pf1ks.config.CFG.changePrefix)) {
    return result;
  }

  switch (target) {
    case `${pf1ks.config.CFG.changePrefix}_consumption`:
      result.push("system.consumption.total");
      break;
    case `${pf1ks.config.CFG.changePrefix}_speed`:
      result.push("system.speed.total");
      break;
    case `${pf1ks.config.CFG.changePrefix}_bonus_tactic`:
      result.push("system.tactics.max.total");
      break;
    case `${pf1ks.config.CFG.changePrefix}_dv`:
      result.push("system.dv.total");
      break;
    case `${pf1ks.config.CFG.changePrefix}_om`:
      result.push("system.om.total");
      break;
    case `${pf1ks.config.CFG.changePrefix}_damage`:
      result.push("system.damageBonus.total");
      break;
    case `${pf1ks.config.CFG.changePrefix}_morale`:
      result.push("system.morale.total");
      break;
    case `${pf1ks.config.CFG.changePrefix}_economy`:
      result.push("system.economy.total");
      break;
    case `${pf1ks.config.CFG.changePrefix}_loyalty`:
      result.push("system.loyalty.total");
      break;
    case `${pf1ks.config.CFG.changePrefix}_stability`:
      result.push("system.stability.total");
      break;
    // settlement modifiers are handled outside the normal change flow
    case `${pf1ks.config.CFG.changePrefix}_defense`:
    case `${pf1ks.config.CFG.changePrefix}_baseValue`:
    case `${pf1ks.config.CFG.changePrefix}_corruption`:
    case `${pf1ks.config.CFG.changePrefix}_crime`:
    case `${pf1ks.config.CFG.changePrefix}_productivity`:
    case `${pf1ks.config.CFG.changePrefix}_law`:
    case `${pf1ks.config.CFG.changePrefix}_lore`:
    case `${pf1ks.config.CFG.changePrefix}_society`:
      break;
    case `${pf1ks.config.CFG.changePrefix}_bonusBP`:
      result.push("system.bonusBP.total");
      break;
    case `${pf1ks.config.CFG.changePrefix}_fame`:
      result.push("system.fame.total");
      break;
    case `${pf1ks.config.CFG.changePrefix}_infamy`:
      result.push("system.infamy.total");
      break;
  }

  return result;
}
