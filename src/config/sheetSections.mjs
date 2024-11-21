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
      create: { type: kingdomTacticId },
      filters: { type: kingdomTacticId },
      interface: {
        create: true,
        browse: true,
      },
      label: `PF1.Subtypes.Item.${kingdomTacticId}.Plural`,
      browseLabel: "PF1KS.Browse.Tactics",
    },
    special: {
      create: { type: kingdomSpecialId },
      filters: { type: kingdomSpecialId },
      interface: {
        create: true,
        browse: true,
      },
      label: `PF1.Subtypes.Item.${kingdomSpecialId}.Plural`,
      browseLabel: "PF1KS.Browse.Special",
    },
  },
  armyCommander: {
    boon: {
      create: { type: kingdomBoonId },
      filters: { type: kingdomBoonId },
      interface: {
        create: true,
        browse: true,
      },
      label: `PF1.Subtypes.Item.${kingdomBoonId}.Plural`,
      browseLabel: "PF1KS.Browse.Boons",
    },
  },
  kingdomSettlement: {
    building: {
      create: { type: kingdomBuildingId },
      filters: { type: kingdomBuildingId },
      interface: {
        create: true,
      },
      label: `PF1.Subtypes.Item.${kingdomBuildingId}.Plural`,
    },
  },
  kingdomTerrain: {
    general: {
      create: { type: kingdomImprovementId, system: { subType: "general" } },
      filters: { type: kingdomImprovementId, system: { subType: "general" } },
      interface: {
        create: true,
      },
      label: `PF1.Subtypes.Item.${kingdomImprovementId}.Plural`,
    },
    special: {
      create: { type: kingdomImprovementId, system: { subType: "special" } },
      filters: { type: kingdomImprovementId, system: { subType: "special" } },
      interface: {
        create: true,
      },
      label: `PF1.Subtypes.Item.${kingdomImprovementId}.Plural`,
    },
  },
  kingdomEvent: {
    active: {
      create: { type: kingdomEventId, system: { subType: "active" } },
      filters: { type: kingdomEventId, system: { subType: "active" } },
      interface: {
        create: true,
      },
      label: `PF1.Subtypes.Item.${kingdomEventId}.Plural`,
    },
    misc: {
      create: { type: kingdomEventId, system: { subType: "misc" } },
      filters: { type: kingdomEventId, system: { subType: "misc" } },
      interface: {
        create: true,
      },
      label: `PF1.Subtypes.Item.${kingdomEventId}.Plural`,
    },
  },
  kingdomArmy: {
    army: {
      create: { type: kingdomArmyId },
      filters: { type: kingdomArmyId },
      interface: {
        create: true,
      },
      label: `PF1.Subtypes.Item.${kingdomArmyId}.Plural`,
    },
  },
};
