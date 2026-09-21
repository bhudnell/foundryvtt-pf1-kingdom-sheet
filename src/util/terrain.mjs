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
  for (const improvementId of hex.improvements ?? []) {
    for (const change of applyBaseMechanics(improvementId)) {
      changes.push({
        ...change,
        sourceType: "terrainImprovement",
        sourceId: improvementId,
      });
    }
  }

  // 2. terrain-based modifiers
  for (const specialTerrainId of hex.specialTerrain ?? []) {
    for (const change of applySpecialTerrainEffects(specialTerrainId, hex.improvements ?? [])) {
      changes.push({
        ...change,
        sourceType: "specialTerrain",
        sourceId: specialTerrainId,
      });
    }
  }

  return changes;
}

function applyBaseMechanics(improvementId) {
  const improvement = pf1ks.config.terrainImprovement[improvementId];

  return improvement.mechanics?.changes ?? [];
}

function applySpecialTerrainEffects(specialTerrainId, improvements) {
  const results = [];

  const terrain = pf1ks.config.specialTerrain[specialTerrainId];

  if (terrain?.mechanics?.changes?.length) {
    results.push(...terrain.mechanics.changes);
  }

  if (!terrain?.interactions?.length) {
    return results;
  }

  for (const interaction of terrain.interactions) {
    switch (interaction.type) {
      case "improvementMap": {
        const map = interaction.map;

        for (const imp of improvements) {
          const effects = map[imp];
          if (effects) {
            results.push(...effects);
          }
        }
        break;
      }

      case "affectsImprovements": {
        const set = new Set(interaction.improvements);

        if (improvements.some((i) => set.has(i))) {
          results.push(...interaction.apply);
        }
        break;
      }

      case "requiresImprovementPresence": {
        const set = new Set(interaction.improvements);

        if (improvements.some((i) => set.has(i))) {
          results.push(...interaction.apply);
        }
        break;
      }
    }
  }

  return results;
}
