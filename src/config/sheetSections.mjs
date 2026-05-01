import {
  armyId,
  boonId,
  buildingId,
  kingdomEventId,
  featureId,
  improvementId,
  settlementEventId,
  specialId,
  tacticId,
} from "./config.mjs";

export const sheetSections = {
  armyFeature: {
    tactic: {
      label: `PF1.Subtypes.Item.${tacticId}.Plural`,
      filters: [{ type: tacticId }],
      interface: {
        disable: true,
      },
      browse: { category: "tactics" },
      create: { type: tacticId },
      browseLabel: "PF1KS.Browse.Tactics",
    },
    special: {
      label: `PF1.Subtypes.Item.${specialId}.Plural`,
      filters: [{ type: specialId }],
      interface: {},
      browse: { category: "special" },
      create: { type: specialId },
      browseLabel: "PF1KS.Browse.Special",
    },
  },
  armyCommander: {
    boon: {
      label: `PF1.Subtypes.Item.${boonId}.Plural`,
      filters: [{ type: boonId }],
      interface: {},
      browse: { category: "boons" },
      create: { type: boonId },
      browseLabel: "PF1KS.Browse.Boons",
    },
  },
  kingdomTerrain: {
    general: {
      label: `PF1.Subtypes.Item.${improvementId}.general.Plural`,
      filters: [{ type: improvementId, subTypes: ["general"] }],
      interface: {},
      browse: { category: "improvements", improvementType: ["general"] },
      create: { type: improvementId, system: { subType: "general" } },
      browseLabel: "PF1KS.Browse.Improvements",
    },
    special: {
      label: `PF1.Subtypes.Item.${improvementId}.special.Plural`,
      filters: [{ type: improvementId, subTypes: ["special"] }],
      interface: {},
      browse: { category: "improvements", improvementType: ["special"] },
      create: { type: improvementId, system: { subType: "special" } },
      browseLabel: "PF1KS.Browse.Improvements",
    },
  },
  kingdomEvent: {
    active: {
      label: `PF1.Subtypes.Item.${kingdomEventId}.active.Plural`,
      filters: [{ type: kingdomEventId, subTypes: ["active"] }],
      interface: {},
      browse: { category: "kingdomEvents", eventType: ["active"] },
      create: { type: kingdomEventId, system: { subType: "active" } },
      browseLabel: "PF1KS.Browse.Events",
    },
    misc: {
      label: `PF1.Subtypes.Item.${kingdomEventId}.misc.Plural`,
      filters: [{ type: kingdomEventId, subTypes: ["misc"] }],
      interface: {},
      browse: { category: "kingdomEvents", eventType: ["misc"] },
      create: { type: kingdomEventId, system: { subType: "misc" } },
      browseLabel: "PF1KS.Browse.Events",
    },
    settlement: {
      label: `PF1KS.Event.SubTypes.Settlement`,
      filters: [{ type: settlementEventId }],
      interface: { settlement: true },
    },
  },
  kingdomArmy: {
    army: {
      label: `PF1.Subtypes.Item.${armyId}.Plural`,
      filters: [{ type: armyId }],
      interface: {},
      create: { type: armyId },
    },
  },
  settlementBuilding: {
    building: {
      label: `PF1.Subtypes.Item.${buildingId}.Plural`,
      filters: [{ type: buildingId }],
      interface: {},
      browse: { category: "buildings" },
      create: { type: buildingId },
      browseLabel: "PF1KS.Browse.Buildings",
    },
  },
  settlementFeature: {
    quality: {
      label: `PF1.Subtypes.Item.${featureId}.quality.Plural`,
      filters: [{ type: featureId, subTypes: ["quality"] }],
      interface: {},
      browse: { category: "features", featureType: ["quality"] },
      create: { type: featureId, system: { subType: "quality" } },
      browseLabel: "PF1KS.Browse.Features",
    },
    disadvantage: {
      label: `PF1.Subtypes.Item.${featureId}.disadvantage.Plural`,
      filters: [{ type: featureId, subTypes: ["disadvantage"] }],
      interface: {},
      browse: { category: "features", featureType: ["disadvantage"] },
      create: { type: featureId, system: { subType: "disadvantage" } },
      browseLabel: "PF1KS.Browse.Features",
    },
    misc: {
      label: `PF1.Subtypes.Item.${featureId}.misc.Plural`,
      filters: [{ type: featureId, subTypes: ["misc"] }],
      interface: {},
      browse: { category: "features", featureType: ["misc"] },
      create: { type: featureId, system: { subType: "misc" } },
      browseLabel: "PF1KS.Browse.Features",
    },
  },
  settlementEvent: {
    active: {
      label: `PF1.Subtypes.Item.${settlementEventId}.active.Plural`,
      filters: [{ type: settlementEventId, subTypes: ["active"] }],
      interface: {},
      browse: { category: "settlementEvents", eventType: ["active"] },
      create: { type: settlementEventId, system: { subType: "active" } },
      browseLabel: "PF1KS.Browse.Events",
    },
    misc: {
      label: `PF1.Subtypes.Item.${settlementEventId}.misc.Plural`,
      filters: [{ type: settlementEventId, subTypes: ["misc"] }],
      interface: {},
      browse: { category: "settlementEvents", eventType: ["misc"] },
      create: { type: settlementEventId, system: { subType: "misc" } },
      browseLabel: "PF1KS.Browse.Events",
    },
  },
};
