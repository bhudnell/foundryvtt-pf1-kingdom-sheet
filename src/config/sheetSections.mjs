import {
  kingdomArmyId,
  kingdomBoonId,
  kingdomBuildingId,
  kingdomEventId,
  kingdomImprovementId,
  kingdomSpecialId,
  kingdomTacticId,
} from "./config.mjs";

export const sheetSections = {
  armyFeature: {
    tactic: {
      category: "armyTactic",
      create: { type: kingdomTacticId },
      filters: { type: kingdomTacticId },
      id: "tactic",
      interface: {
        create: true,
      },
      label: `PF1.Subtypes.Item.${kingdomTacticId}.Plural`,
      path: "armyFeature.tactic",
    },
    special: {
      category: "armySpecial",
      create: { type: kingdomSpecialId },
      filters: { type: kingdomSpecialId },
      id: "special",
      interface: {
        create: true,
      },
      label: `PF1.Subtypes.Item.${kingdomSpecialId}.Plural`,
      path: "armyFeature.special",
    },
  },
  armyBoon: {
    default: {
      category: "armyBoon",
      create: { type: kingdomBoonId },
      filters: { type: kingdomBoonId },
      id: "default",
      interface: {
        create: true,
      },
      label: `PF1.Subtypes.Item.${kingdomBoonId}.Plural`,
      path: "armyBoon.default",
    },
  },
  kingdomBuilding: {
    default: {
      category: "kingdomBuilding",
      create: { type: kingdomBuildingId },
      filters: { type: kingdomBuildingId },
      id: "default",
      interface: {
        create: true,
      },
      label: `PF1.Subtypes.Item.${kingdomBuildingId}.Plural`,
      path: "kingdomBuilding.default",
    },
  },
  kingdomImprovement: {
    general: {
      category: "kingdomImprovement",
      create: { type: kingdomImprovementId, system: { subType: "general" } },
      filters: { type: kingdomImprovementId, system: { subType: "general" } },
      id: "general",
      interface: {
        create: true,
      },
      label: `PF1.Subtypes.Item.${kingdomImprovementId}.Plural`,
      path: "kingdomImprovement.general",
    },
    special: {
      category: "kingdomImprovement",
      create: { type: kingdomImprovementId, system: { subType: "special" } },
      filters: { type: kingdomImprovementId, system: { subType: "special" } },
      id: "special",
      interface: {
        create: true,
      },
      label: `PF1.Subtypes.Item.${kingdomImprovementId}.Plural`,
      path: "kingdomImprovement.special",
    },
  },
  kingdomEvent: {
    active: {
      category: "kingdomEvent",
      create: { type: kingdomEventId, system: { subType: "active" } },
      filters: { type: kingdomEventId, system: { subType: "active" } },
      id: "active",
      interface: {
        create: true,
      },
      label: `PF1.Subtypes.Item.${kingdomEventId}.Plural`,
      path: "kingdomEvent.active",
    },
    misc: {
      category: "kingdomEvent",
      create: { type: kingdomEventId, system: { subType: "misc" } },
      filters: { type: kingdomEventId, system: { subType: "misc" } },
      id: "misc",
      interface: {
        create: true,
      },
      label: `PF1.Subtypes.Item.${kingdomEventId}.Plural`,
      path: "kingdomEvent.misc",
    },
  },
  kingdomArmy: {
    default: {
      category: "kingdomArmy",
      create: { type: kingdomArmyId },
      filters: { type: kingdomArmyId },
      id: "default",
      interface: {
        create: true,
      },
      label: `PF1.Subtypes.Item.${kingdomArmyId}.Plural`,
      path: "kingdomArmy.default",
    },
  },
};
