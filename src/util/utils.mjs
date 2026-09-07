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

export function asSignedPercent(num) {
  if (num === 0) {
    return "0%";
  }
  return (num > 0 ? "+" : "") + num.toString() + "%";
}

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
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

export function registerSetting(
  { config = true, defaultValue = null, key, scope = "world", settingType = String },
  { skipReady = false } = {}
) {
  const doIt = () =>
    game.settings.register(pf1ks.config.moduleId, key, {
      name: `${pf1ks.config.moduleId}.settings.${key}.name`,
      hint: `${pf1ks.config.moduleId}.settings.${key}.hint`,
      default: defaultValue,
      scope,
      requiresReload: false,
      config,
      type: settingType,
    });

  game.ready || skipReady ? doIt() : Hooks.once("ready", doIt);
}

export function log(msg) {
  console.log(`${pf1ks.config.moduleId} - ${msg}`);
}

export function renderCachedTemplate(path, data = {}) {
  const template = Handlebars.partials[path];
  if (!template) {
    throw new Error(`Template ${path} not found in cache`);
  }

  return template(data, {
    allowProtoMethodsByDefault: true,
    allowProtoPropertiesByDefault: true,
    preventIndent: true,
  });
}

export function validateImprovement(improvement, context) {
  const failures = [];

  for (const requirement of improvement.requirements ?? []) {
    const result = validateRequirement(requirement, { ...context, improvementId: improvement.id });

    if (!result.valid) {
      failures.push(...result.failures);
    }
  }

  return {
    valid: failures.length === 0,
    failures,
  };
}

function validateRequirement(requirement, context) {
  switch (requirement.type) {
    case "terrain":
      return {
        valid: requirement.allowed.includes(context.terrain),
        failures: requirement.allowed.includes(context.terrain)
          ? []
          : [game.i18n.localize("PF1KS.Improvement.Error.InvalidTerrain")],
      };

    case "specialTerrain":
      return {
        valid: context.specialTerrain?.includes(requirement.specialTerrain),
        failures: context.specialTerrain?.includes(requirement.specialTerrain)
          ? []
          : [game.i18n.format("PF1KS.Improvement.Error.Requires", { requirement: requirement.specialTerrain })],
      };

    case "improvement":
      return {
        valid: context.improvements?.includes(requirement.improvement),
        failures: context.improvements?.includes(requirement.improvement)
          ? []
          : [game.i18n.format("PF1KS.Improvement.Error.Requires", { requirement: requirement.improvement })],
      };

    case "kingdomSize":
      return {
        valid: (context.kingdom?.system.size ?? 0) >= requirement.min,
        failures:
          (context.kingdom?.system.size ?? 0) >= requirement.min
            ? []
            : [game.i18n.format("PF1KS.Improvement.Error.KingdomSize", { min: requirement.min })],
      };

    case "exclusiveGroup": {
      const group = pf1ks.config.improvementGroups[requirement.group] ?? [];

      const conflict = context.improvements?.find((i) => i !== context.improvementId && group.includes(i));

      return {
        valid: !conflict,
        failures: conflict ? [game.i18n.format("PF1KS.Improvement.Error.Conflict", { conflict })] : [],
      };
    }

    case "ifTerrain": {
      if (!requirement.terrain.includes(context.terrain)) {
        return {
          valid: true,
          failures: [],
        };
      }

      return validateRequirement(requirement.then, context);
    }

    case "not": {
      const result = validateRequirement(requirement.requirement, context);

      return {
        valid: !result.valid,
        failures: !result.valid ? [] : [game.i18n.localize("PF1KS.Improvement.Error.Not")],
      };
    }

    case "allOf": {
      const failures = [];

      for (const req of requirement.requirements) {
        const result = validateRequirement(req, context);
        failures.push(...result.failures);
      }

      return {
        valid: failures.length === 0,
        failures,
      };
    }

    case "oneOf": {
      const results = requirement.requirements.map((req) => validateRequirement(req, context));

      const valid = results.some((r) => r.valid);

      if (valid) {
        return {
          valid: true,
          failures: [],
        };
      }

      return {
        valid: false,
        failures: results.flatMap((r) => r.failures),
      };
    }

    case "networkSourceTerrain":
      // TODO Placeholder for aqueduct path validation.
      return {
        valid: true,
        failures: [],
      };

    default:
      console.warn(`Unknown requirement type: ${requirement.type}`);

      return {
        valid: false,
        failures: [game.i18n.localize("PF1KS.Improvement.Error.UnknownRequirement")],
      };
  }
}

export function computeHexEffects(hex) {
  const changes = [];

  // 1. base improvement effects
  for (const imp of hex.improvements ?? []) {
    changes.push(...applyBaseMechanics(imp));
  }

  // 2. terrain-based modifiers
  changes.push(...applySpecialTerrainEffects(hex));

  const condensed = new Map();

  for (const change of changes) {
    const existing = condensed.get(change.target);

    if (existing) {
      existing.formula += change.formula;
    } else {
      condensed.set(change.target, { ...change });
    }
  }

  return [...condensed.values()];
}

function applyBaseMechanics(improvementId) {
  const improvement = pf1ks.config.terrainImprovements[improvementId];

  return improvement.mechanics?.changes ?? [];
}

function applySpecialTerrainEffects(hex) {
  const results = [];

  for (const specialTerrainId of hex.specialTerrain ?? []) {
    const terrain = pf1ks.config.specialTerrain[specialTerrainId];
    if (!terrain?.interactions) {
      continue;
    }

    for (const interaction of terrain.interactions) {
      switch (interaction.type) {
        case "improvementMap": {
          const map = interaction.map;

          for (const imp of hex.improvements ?? []) {
            const effects = map[imp];
            if (effects) {
              results.push(...effects);
            }
          }
          break;
        }

        case "affectsImprovements": {
          const set = new Set(interaction.improvements);

          if ((hex.improvements ?? []).some((i) => set.has(i))) {
            results.push(...interaction.apply);
          }
          break;
        }

        case "requiresImprovementPresence": {
          const set = new Set(interaction.improvements);

          if ((hex.improvements ?? []).some((i) => set.has(i))) {
            results.push(...interaction.apply);
          }
          break;
        }
      }
    }
  }

  return results;
}
