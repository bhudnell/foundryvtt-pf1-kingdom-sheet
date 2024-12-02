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
      filters: [{ type: kingdomTacticId }],
      interface: {
        disable: true,
      },
      label: `PF1.Subtypes.Item.${kingdomTacticId}.Plural`,
      browseLabel: "PF1KS.Browse.Tactics",
    },
    special: {
      create: { type: kingdomSpecialId },
      filters: [{ type: kingdomSpecialId }],
      interface: {},
      label: `PF1.Subtypes.Item.${kingdomSpecialId}.Plural`,
      browseLabel: "PF1KS.Browse.Special",
    },
  },
  armyCommander: {
    boon: {
      create: { type: kingdomBoonId },
      filters: [{ type: kingdomBoonId }],
      interface: {},
      label: `PF1.Subtypes.Item.${kingdomBoonId}.Plural`,
      browseLabel: "PF1KS.Browse.Boons",
    },
  },
  kingdomSettlement: {
    building: {
      create: { type: kingdomBuildingId },
      filters: [{ type: kingdomBuildingId }],
      interface: {},
      label: `PF1.Subtypes.Item.${kingdomBuildingId}.Plural`,
    },
  },
  kingdomTerrain: {
    general: {
      create: { type: kingdomImprovementId, system: { subType: "general" } },
      filters: [{ type: kingdomImprovementId, subTypes: ["general"] }],
      interface: {},
      label: `PF1.Subtypes.Item.${kingdomImprovementId}.general.Plural`,
    },
    special: {
      create: { type: kingdomImprovementId, system: { subType: "special" } },
      filters: [{ type: kingdomImprovementId, subTypes: ["special"] }],
      interface: {},
      label: `PF1.Subtypes.Item.${kingdomImprovementId}.special.Plural`,
    },
  },
  kingdomEvent: {
    active: {
      create: { type: kingdomEventId, system: { subType: "active" } },
      filters: [{ type: kingdomEventId, subTypes: ["active"] }],
      interface: {},
      label: `PF1.Subtypes.Item.${kingdomEventId}.active.Plural`,
    },
    misc: {
      create: { type: kingdomEventId, system: { subType: "misc" } },
      filters: [{ type: kingdomEventId, subTypes: ["misc"] }],
      interface: {},
      label: `PF1.Subtypes.Item.${kingdomEventId}.misc.Plural`,
    },
  },
  kingdomArmy: {
    army: {
      create: { type: kingdomArmyId },
      filters: [{ type: kingdomArmyId }],
      interface: {},
      label: `PF1.Subtypes.Item.${kingdomArmyId}.Plural`,
    },
  },
};
