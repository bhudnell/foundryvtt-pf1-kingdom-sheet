export function findLargestSmallerNumber(arr, num) {
  return arr
    .filter((value) => value < num) // Filter out numbers larger than or equal to the target
    .reduce((largest, current) => {
      return current > largest ? current : largest;
    }, -Infinity); // Initialize with a very small number
}

export function renameKeys(obj, keyMap) {
  return Object.keys(obj).reduce((acc, key) => {
    const newKey = keyMap[key] || key; // Use the new key if available, otherwise keep the old key
    acc[newKey] = obj[key];
    return acc;
  }, {});
}

/**
 * Recursively transforms an ES module to a regular, writable object.
 *
 * @internal
 * @template T
 * @param {T} module - The ES module to transform.
 * @returns {T} The transformed module.
 */
export function moduleToObject(module) {
  const result = {};
  for (const key in module) {
    if (Object.prototype.toString.call(module[key]) === "[object Module]") {
      result[key] = moduleToObject(module[key]);
    } else {
      result[key] = module[key];
    }
  }
  return result;
}

export function keepUpdateArray(sourceObj, targetObj, keepPath) {
  const newValue = foundry.utils.getProperty(targetObj, keepPath);
  if (newValue == null) {
    return;
  }
  if (Array.isArray(newValue)) {
    return;
  }

  const newArray = foundry.utils.deepClone(foundry.utils.getProperty(sourceObj, keepPath) || []);

  for (const [key, value] of Object.entries(newValue)) {
    if (foundry.utils.getType(value) === "Object") {
      const subData = foundry.utils.expandObject(value);
      newArray[key] = foundry.utils.mergeObject(newArray[key], subData);
    } else {
      newArray[key] = value;
    }
  }

  foundry.utils.setProperty(targetObj, keepPath, newArray);
}

export async function rollEventTable(event, message) {
  event.preventDefault();

  const table = await fromUuid(`Compendium.${pf1ks.config.moduleId}.roll-table.RollTable.veIcI8coYE6ZRqFG`);
  return table.draw();
}

export class DefaultChange extends pf1.components.ItemChange {
  constructor(formula, target, flavor, options = {}) {
    const data = {
      formula,
      target,
      type: "untyped",
      operator: "add",
      priority: 1000,
      flavor: game.i18n.localize(flavor),
    };

    super(data, options);
  }
}

export function applyChange(change, actor, targets = null, { applySourceInfo = true, rollData } = {}) {
  // Prepare change targets
  targets ??= change.getTargets(actor);

  rollData ??= change.parent ? change.parent.getRollData({ refresh: true }) : actor.getRollData({ refresh: true });

  const overrides = actor.changeOverrides;
  for (const t of targets) {
    const override = overrides[t];
    const operator = change.operator;

    // HACK: Data prep change application creates overrides; only changes meant for manual comparison lack them,
    // and those do not have to be applied to the actor.
    // This hack enables calling applyChange on Changes that are not meant to be applied, but require a call to
    // determine effective operator and/or value.
    if (!override) {
      continue;
    }

    let value = 0;
    if (change.formula) {
      if (!isNaN(change.formula)) {
        value = parseFloat(change.formula);
      } else if (change.isDeferred && pf1.dice.RollPF.parse(change.formula).some((t) => !t.isDeterministic)) {
        value = pf1.dice.RollPF.replaceFormulaData(change.formula, rollData, { missing: 0 });
      } else {
        value = pf1.dice.RollPF.safeRollSync(
          change.formula,
          rollData,
          { formula: change.formula, target: t, change, rollData },
          { suppressError: change.parent && !change.parent.isOwner },
          { maximize: true }
        ).total;
      }
    }

    // multiply change value by the parent item quantity
    // These two lines are the only differences between this function and the system ItemChange.applyChange function
    value *= change.parent?.system.quantity ?? 1;
    value = Math.floor(value);

    change.value = value;

    if (!t) {
      continue;
    }

    const prior = override[operator][change.type];

    switch (operator) {
      case "add":
        {
          let base = foundry.utils.getProperty(actor, t);

          // Don't change non-existing ability scores
          if (base == null) {
            if (t.match(/^system\.abilities/)) {
              continue;
            }
            base = 0;
          }

          // Deferred formula
          if (typeof value === "string") {
            break;
          }

          if (typeof base === "number") {
            // Skip positive dodge modifiers if lose dex to AC is in effect
            if (actor.changeFlags.loseDexToAC && value > 0 && change.type === "dodge" && change.isAC) {
              continue;
            }

            if (pf1.config.stackingBonusTypes.includes(change.type)) {
              // Add stacking bonus
              foundry.utils.setProperty(actor, t, base + value);
              override[operator][change.type] = (prior ?? 0) + value;
            } else {
              // Use higher value only
              const diff = !prior ? value : Math.max(0, value - (prior ?? 0));
              foundry.utils.setProperty(actor, t, base + diff);
              override[operator][change.type] = Math.max(prior ?? 0, value);
            }
          }
        }
        break;

      case "set":
        foundry.utils.setProperty(actor, t, value);
        override[operator][change.type] = value;
        break;
    }

    if (applySourceInfo) {
      change.applySourceInfo(actor);
    }

    // Adjust ability modifier
    const modifierChanger = t.match(/^system\.abilities\.([a-zA-Z0-9]+)\.(?:total|penalty|base)$/);
    const abilityTarget = modifierChanger?.[1];
    if (abilityTarget) {
      const ability = actor.system.abilities[abilityTarget];
      ability.mod = pf1.utils.getAbilityModifier(ability.total, {
        damage: ability.damage,
        penalty: ability.penalty,
      });
    }
  }
}
